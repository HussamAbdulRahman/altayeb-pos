import { useState, useRef, useCallback } from 'react'
import { PRODUCTS, CATEGORIES, type Product, type Category } from '../data/products'
import { t, type Lang } from '../data/i18n'

export interface CartItem {
  product: Product
  qty: number
}

export interface Transaction {
  id: string
  items: CartItem[]
  subtotal: number
  tax: number
  total: number
  paid: number
  change: number
  method: 'cash' | 'card'
  time: Date
}

const fmt = (n: number) => `${n.toFixed(2)} ج.م`

export default function POSSystem() {
  const [lang, setLang] = useState<Lang>('ar')
  const [activeCategory, setActiveCategory] = useState<Category>('all')
  const [search, setSearch] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])
  const [showReceipt, setShowReceipt] = useState(false)
  const [lastTransaction, setLastTransaction] = useState<Transaction | null>(null)
  const [showPayment, setShowPayment] = useState(false)
  const [cashInput, setCashInput] = useState('')
  const [payMethod, setPayMethod] = useState<'cash' | 'card'>('cash')
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [notification, setNotification] = useState<string | null>(null)

  const tr = t[lang]
  const isRTL = lang === 'ar'
  const dir = isRTL ? 'rtl' : 'ltr'

  const notify = (msg: string) => {
    setNotification(msg)
    setTimeout(() => setNotification(null), 2000)
  }

  const toggleLang = () => setLang(l => l === 'ar' ? 'en' : 'ar')

  const filtered = PRODUCTS.filter(p => {
    const inCat = activeCategory === 'all' || p.category === activeCategory
    const q = search.toLowerCase()
    const inSearch = !q || p.name.toLowerCase().includes(q) || p.nameAr.includes(q) || p.barcode.includes(q)
    return inCat && inSearch
  })

  const addToCart = useCallback((product: Product) => {
    setCart(prev => {
      const ex = prev.find(i => i.product.id === product.id)
      if (ex) return prev.map(i => i.product.id === product.id ? { ...i, qty: i.qty + 1 } : i)
      return [...prev, { product, qty: 1 }]
    })
    notify(`${tr.added} ${isRTL ? product.nameAr : product.name}`)
  }, [lang])

  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(i => i.product.id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i).filter(i => i.qty > 0))
  }

  const removeItem = (id: string) => setCart(prev => prev.filter(i => i.product.id !== id))
  const clearCart = () => { setCart([]); setCashInput(''); setShowPayment(false) }

  const subtotal = cart.reduce((s, i) => s + i.product.price * i.qty, 0)
  const tax = subtotal * 0.05
  const total = subtotal + tax
  const cashPaid = parseFloat(cashInput) || 0
  const change = cashPaid - total

  const handleBarcode = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const val = (e.target as HTMLInputElement).value.trim()
      const p = PRODUCTS.find(pr => pr.barcode === val)
      if (p) { addToCart(p); setSearch('') }
      else { notify(tr.barcodeNotFound); setSearch('') }
    }
  }

  const processPayment = () => {
    if (payMethod === 'cash' && cashPaid < total) return
    const tx: Transaction = {
      id: `TX${Date.now()}`,
      items: [...cart],
      subtotal, tax, total,
      paid: payMethod === 'card' ? total : cashPaid,
      change: payMethod === 'card' ? 0 : change,
      method: payMethod,
      time: new Date(),
    }
    setLastTransaction(tx)
    setTransactions(prev => [tx, ...prev])
    setShowPayment(false)
    setShowReceipt(true)
    setCart([])
    setCashInput('')
  }

  const totalItems = cart.reduce((s, i) => s + i.qty, 0)
  const canCharge = payMethod === 'card' || cashPaid >= total

  return (
    <div dir={dir} style={{ display: 'grid', gridTemplateColumns: isRTL ? '380px 1fr' : '1fr 380px', height: '100vh', background: '#0f1117', overflow: 'hidden' }}>

      {/* ── NOTIFICATION ── */}
      {notification && (
        <div style={{ position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)', background: '#f5a623', color: '#0f1117', padding: '8px 20px', borderRadius: 4, fontWeight: 700, fontSize: 13, zIndex: 9999, whiteSpace: 'nowrap', boxShadow: '0 4px 20px rgba(0,0,0,0.4)', direction: 'ltr' }}>
          {notification}
        </div>
      )}

      {/* ══ CART (right in LTR, left in RTL) ══ */}
      <div style={{ display: isRTL ? 'none' : 'contents' }} />
      {isRTL && <CartPanel lang={lang} tr={tr} isRTL={isRTL} cart={cart} showPayment={showPayment} setShowPayment={setShowPayment} payMethod={payMethod} setPayMethod={setPayMethod} cashInput={cashInput} setCashInput={setCashInput} cashPaid={cashPaid} change={change} canCharge={canCharge} subtotal={subtotal} tax={tax} total={total} totalItems={totalItems} updateQty={updateQty} removeItem={removeItem} clearCart={clearCart} processPayment={processPayment} fmt={fmt} />}

      {/* ══ CATALOG ══ */}
      <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRight: isRTL ? 'none' : '1px solid #2e3145', borderLeft: isRTL ? '1px solid #2e3145' : 'none' }}>

        {/* Header */}
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #2e3145', display: 'flex', alignItems: 'center', gap: 12, background: '#13161f' }}>
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
            <span style={{ fontWeight: 700, fontSize: 16, color: '#f5a623', letterSpacing: isRTL ? 0 : '0.04em' }}>{tr.marketName}</span>
            <span style={{ fontSize: 10, color: '#8a8680', fontFamily: 'monospace', marginTop: 3 }}>{tr.marketNameSub}</span>
          </div>
          <div style={{ marginInlineStart: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
            {/* Lang toggle */}
            <button onClick={toggleLang} style={{ background: '#1a1d27', border: '1px solid #f5a623', color: '#f5a623', padding: '5px 14px', borderRadius: 20, fontSize: 12, cursor: 'pointer', fontWeight: 700, fontFamily: 'inherit', letterSpacing: '0.04em', transition: 'all 0.15s' }}>
              {lang === 'ar' ? 'EN' : 'ع'}
            </button>
            <button onClick={() => setShowHistory(!showHistory)} style={{ background: '#252836', border: '1px solid #2e3145', color: '#c8c4bc', padding: '6px 14px', borderRadius: 4, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
              {tr.history} ({transactions.length})
            </button>
            <div style={{ background: '#1a1d27', border: '1px solid #2e3145', borderRadius: 4, padding: '4px 10px', fontSize: 11, color: '#8a8680', fontFamily: 'monospace', display: 'flex', alignItems: 'center' }}>
              {new Date().toLocaleDateString(isRTL ? 'ar-KW' : 'en-GB')}
            </div>
          </div>
        </div>

        {/* Search */}
        <div style={{ padding: '12px 20px', borderBottom: '1px solid #2e3145', background: '#13161f' }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={handleBarcode}
            placeholder={tr.searchPlaceholder}
            dir={dir}
            style={{ width: '100%', background: '#1a1d27', border: '1px solid #2e3145', borderRadius: 4, color: '#f0ede8', padding: '9px 14px', fontSize: 13, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', textAlign: isRTL ? 'right' : 'left' }}
          />
        </div>

        {/* Category tabs */}
        <div style={{ display: 'flex', flexDirection: isRTL ? 'row-reverse' : 'row', gap: 6, padding: '10px 20px', overflowX: 'auto', borderBottom: '1px solid #2e3145', background: '#13161f', scrollbarWidth: 'none' }}>
          {CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => setActiveCategory(cat.id)} style={{ whiteSpace: 'nowrap', padding: '6px 14px', borderRadius: 4, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', border: 'none', transition: 'all 0.15s', background: activeCategory === cat.id ? '#f5a623' : '#1a1d27', color: activeCategory === cat.id ? '#0f1117' : '#c8c4bc' }}>
              {cat.icon} {isRTL ? cat.labelAr : cat.label}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10, alignContent: 'start' }}>
          {filtered.map(product => (
            <ProductCard key={product.id} product={product} lang={lang} onAdd={addToCart} />
          ))}
          {filtered.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', color: '#8a8680', padding: 40, fontSize: 13 }}>
              {tr.noItemsFound}
            </div>
          )}
        </div>
      </div>

      {/* Cart on right for LTR */}
      {!isRTL && <CartPanel lang={lang} tr={tr} isRTL={isRTL} cart={cart} showPayment={showPayment} setShowPayment={setShowPayment} payMethod={payMethod} setPayMethod={setPayMethod} cashInput={cashInput} setCashInput={setCashInput} cashPaid={cashPaid} change={change} canCharge={canCharge} subtotal={subtotal} tax={tax} total={total} totalItems={totalItems} updateQty={updateQty} removeItem={removeItem} clearCart={clearCart} processPayment={processPayment} fmt={fmt} />}

      {/* Modals */}
      {showReceipt && lastTransaction && (
        <ReceiptModal transaction={lastTransaction} onClose={() => setShowReceipt(false)} fmt={fmt} lang={lang} tr={tr} isRTL={isRTL} />
      )}
      {showHistory && (
        <HistoryModal transactions={transactions} onClose={() => setShowHistory(false)} fmt={fmt} lang={lang} tr={tr} isRTL={isRTL} />
      )}
    </div>
  )
}

// ── Cart Panel ──
function CartPanel({ lang, tr, isRTL, cart, showPayment, setShowPayment, payMethod, setPayMethod, cashInput, setCashInput, cashPaid, change, canCharge, subtotal, tax, total, totalItems, updateQty, removeItem, clearCart, processPayment, fmt }: any) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', background: '#13161f', overflow: 'hidden', borderRight: isRTL ? '1px solid #2e3145' : 'none' }}>
      {/* Cart header */}
      <div style={{ padding: '14px 18px', borderBottom: '1px solid #2e3145', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontWeight: 700, fontSize: 14, color: '#f0ede8' }}>
          {tr.orderTitle} <span style={{ color: '#8a8680', fontFamily: 'monospace', fontWeight: 400 }}>({totalItems} {tr.items})</span>
        </span>
        {cart.length > 0 && (
          <button onClick={clearCart} style={{ background: 'none', border: '1px solid #3a2020', color: '#c05050', padding: '4px 12px', borderRadius: 4, fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}>
            {tr.clearAll}
          </button>
        )}
      </div>

      {/* Items */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        {cart.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#4a4760', gap: 10 }}>
            <div style={{ fontSize: 36 }}>🛒</div>
            <div style={{ fontSize: 13 }}>{tr.cartEmpty}</div>
            <div style={{ fontSize: 11, color: '#3a3850' }}>{tr.tapToAdd}</div>
          </div>
        ) : (
          cart.map((item: CartItem) => (
            <CartRow key={item.product.id} item={item} lang={lang} isRTL={isRTL} onUpdate={updateQty} onRemove={removeItem} fmt={fmt} />
          ))
        )}
      </div>

      {/* Totals */}
      <div style={{ borderTop: '1px solid #2e3145', padding: '14px 18px', background: '#0f1117' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#8a8680', marginBottom: 6 }}>
          <span>{tr.subtotal}</span>
          <span style={{ fontFamily: 'monospace' }}>{fmt(subtotal)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#8a8680', marginBottom: 10 }}>
          <span>{tr.vat}</span>
          <span style={{ fontFamily: 'monospace' }}>{fmt(tax)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 700, color: '#f5a623', marginBottom: 14, borderTop: '1px solid #2e3145', paddingTop: 10 }}>
          <span>{tr.total}</span>
          <span style={{ fontFamily: 'monospace' }}>{fmt(total)}</span>
        </div>

        {showPayment ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              {(['cash', 'card'] as const).map(m => (
                <button key={m} onClick={() => setPayMethod(m)} style={{ flex: 1, padding: '8px', borderRadius: 4, border: `1px solid ${payMethod === m ? '#f5a623' : '#2e3145'}`, background: payMethod === m ? 'rgba(245,166,35,0.12)' : '#1a1d27', color: payMethod === m ? '#f5a623' : '#8a8680', fontWeight: 600, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
                  {m === 'cash' ? tr.cash : tr.card}
                </button>
              ))}
            </div>
            {payMethod === 'cash' && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6 }}>
                  {[5, 10, 20, 50, 100, 200].map(v => (
                    <button key={v} onClick={() => setCashInput(String(v))} style={{ padding: '7px 4px', background: '#1a1d27', border: '1px solid #2e3145', borderRadius: 4, color: '#c8c4bc', fontSize: 12, cursor: 'pointer', fontFamily: 'monospace' }}>
                      {v}
                    </button>
                  ))}
                </div>
                <input
                  value={cashInput}
                  onChange={e => setCashInput(e.target.value)}
                  placeholder={tr.cashReceived}
                  type="number"
                  dir="ltr"
                  style={{ width: '100%', background: '#1a1d27', border: '1px solid #2e3145', borderRadius: 4, color: '#f0ede8', padding: '9px 14px', fontSize: 14, fontFamily: 'monospace', outline: 'none', boxSizing: 'border-box', textAlign: isRTL ? 'right' : 'left' }}
                />
                {cashPaid > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: change >= 0 ? '#4ade80' : '#f87171', fontFamily: 'monospace', fontWeight: 600 }}>
                    <span>{tr.change}</span>
                    <span>{change >= 0 ? fmt(change) : tr.insufficient}</span>
                  </div>
                )}
              </>
            )}
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setShowPayment(false)} style={{ flex: 1, padding: '10px', background: '#1a1d27', border: '1px solid #2e3145', borderRadius: 4, color: '#8a8680', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
                {tr.cancel}
              </button>
              <button onClick={processPayment} disabled={!canCharge} style={{ flex: 2, padding: '10px', background: canCharge ? '#f5a623' : '#2e3145', border: 'none', borderRadius: 4, color: canCharge ? '#0f1117' : '#4a4760', fontWeight: 700, fontSize: 13, cursor: canCharge ? 'pointer' : 'not-allowed', fontFamily: 'inherit' }}>
                {tr.confirmPayment}
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => cart.length > 0 && setShowPayment(true)}
            disabled={cart.length === 0}
            style={{ width: '100%', padding: '14px', background: cart.length > 0 ? '#f5a623' : '#1a1d27', border: 'none', borderRadius: 4, color: cart.length > 0 ? '#0f1117' : '#4a4760', fontWeight: 700, fontSize: 15, cursor: cart.length > 0 ? 'pointer' : 'not-allowed', fontFamily: 'inherit', letterSpacing: isRTL ? 0 : '0.04em', transition: 'all 0.15s' }}
          >
            {tr.charge} · {fmt(total)}
          </button>
        )}
      </div>
    </div>
  )
}

// ── Product Card ──
function ProductCard({ product, lang, onAdd }: { product: Product; lang: Lang; onAdd: (p: Product) => void }) {
  const [pressed, setPressed] = useState(false)
  const isRTL = lang === 'ar'
  return (
    <button
      onClick={() => onAdd(product)}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      style={{ background: pressed ? '#252836' : '#1a1d27', border: '1px solid #2e3145', borderRadius: 6, padding: '14px 12px', cursor: 'pointer', textAlign: isRTL ? 'right' : 'left', display: 'flex', flexDirection: 'column', gap: 4, transition: 'all 0.1s', transform: pressed ? 'scale(0.97)' : 'scale(1)', outline: 'none', boxShadow: pressed ? 'none' : '0 1px 4px rgba(0,0,0,0.3)' }}
    >
      <span style={{ fontSize: 13, fontWeight: 600, color: '#f0ede8', lineHeight: 1.3 }}>{isRTL ? product.nameAr : product.name}</span>
      <span style={{ fontSize: 11, color: '#6a6680' }}>{isRTL ? product.name : product.nameAr}</span>
      <div style={{ marginTop: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexDirection: isRTL ? 'row-reverse' : 'row' }}>
        <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 13, color: '#f5a623' }}>{product.price.toFixed(3)}</span>
        <span style={{ fontSize: 10, color: '#4a4760' }}>/{product.unit}</span>
      </div>
    </button>
  )
}

// ── Cart Row ──
function CartRow({ item, lang, isRTL, onUpdate, onRemove, fmt }: { item: CartItem; lang: Lang; isRTL: boolean; onUpdate: (id: string, d: number) => void; onRemove: (id: string) => void; fmt: (n: number) => string }) {
  return (
    <div style={{ padding: '8px 18px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid #1e2130', flexDirection: isRTL ? 'row-reverse' : 'row' }}>
      <div style={{ flex: 1, minWidth: 0, textAlign: isRTL ? 'right' : 'left' }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: '#f0ede8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{isRTL ? item.product.nameAr : item.product.name}</div>
        <div style={{ fontSize: 11, color: '#8a8680', fontFamily: 'monospace', direction: 'ltr', textAlign: isRTL ? 'right' : 'left' }}>{item.product.price.toFixed(3)} × {item.qty}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <button onClick={() => onUpdate(item.product.id, -1)} style={{ width: 26, height: 26, background: '#252836', border: '1px solid #2e3145', borderRadius: 4, color: '#c8c4bc', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
        <span style={{ fontFamily: 'monospace', fontSize: 13, minWidth: 22, textAlign: 'center', color: '#f0ede8' }}>{item.qty}</span>
        <button onClick={() => onUpdate(item.product.id, 1)} style={{ width: 26, height: 26, background: '#252836', border: '1px solid #2e3145', borderRadius: 4, color: '#c8c4bc', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
      </div>
      <div style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 600, color: '#f5a623', minWidth: 70, textAlign: isRTL ? 'left' : 'right' }}>
        {fmt(item.product.price * item.qty)}
      </div>
      <button onClick={() => onRemove(item.product.id)} style={{ background: 'none', border: 'none', color: '#4a4760', cursor: 'pointer', fontSize: 14, padding: 2, lineHeight: 1 }}>✕</button>
    </div>
  )
}

// ── Receipt Modal ──
function ReceiptModal({ transaction: tx, onClose, fmt, lang, tr, isRTL }: { transaction: Transaction; onClose: () => void; fmt: (n: number) => string; lang: Lang; tr: any; isRTL: boolean }) {
  const printRef = useRef<HTMLDivElement>(null)

  const handlePrint = () => {
    const content = printRef.current?.innerHTML || ''
    const win = window.open('', '_blank', 'width=400,height=700')
    if (!win) return
    win.document.write(`
      <html><head><title>${tx.id}</title>
      <meta charset="utf-8"/>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;600;700&display=swap');
        body { font-family: 'IBM Plex Sans Arabic','Courier New',monospace; font-size:13px; padding:20px; max-width:300px; margin:0 auto; direction:${isRTL ? 'rtl' : 'ltr'}; }
        .center { text-align:center; }
        .row { display:flex; justify-content:space-between; margin:3px 0; }
        .dashed { border-top:1px dashed #000; margin:8px 0; }
        .bold { font-weight:700; }
        .small { font-size:11px; color:#555; }
        @media print { body { padding:0; } }
      </style></head>
      <body>${content}
      <script>window.onload=()=>{window.print();window.close()}<\/script>
      </body></html>`)
    win.document.close()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: '#1a1d27', border: '1px solid #2e3145', borderRadius: 8, padding: 24, width: 400, maxHeight: '90vh', overflowY: 'auto' }} dir={isRTL ? 'rtl' : 'ltr'}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <span style={{ fontWeight: 700, color: '#f5a623', fontSize: 14 }}>{tr.receiptPreview}</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#8a8680', cursor: 'pointer', fontSize: 18 }}>✕</button>
        </div>

        <div ref={printRef} style={{ background: '#fff', color: '#000', padding: '20px 16px', borderRadius: 4, fontFamily: "'IBM Plex Sans Arabic','Courier New',monospace", fontSize: 12, direction: isRTL ? 'rtl' : 'ltr' }}>
          <div style={{ textAlign: 'center', fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{tr.receiptTitle}</div>
          <div style={{ textAlign: 'center', fontSize: 11, color: '#555', marginBottom: 2 }}>{tr.receiptSub}</div>
          <div style={{ textAlign: 'center', fontSize: 10, color: '#555' }}>{tr.receiptPhone}</div>
          <div style={{ borderTop: '1px dashed #000', margin: '10px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 4 }}>
            <span>{tr.receipt} {tx.id}</span>
            <span>{tx.time.toLocaleString(isRTL ? 'ar-KW' : 'en-GB')}</span>
          </div>
          <div style={{ borderTop: '1px dashed #000', margin: '8px 0' }} />
          {tx.items.map(item => (
            <div key={item.product.id} style={{ marginBottom: 5 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{isRTL ? item.product.nameAr : item.product.name}</span>
                <span style={{ fontFamily: 'monospace' }}>{fmt(item.product.price * item.qty)}</span>
              </div>
              <div style={{ fontSize: 10, color: '#777', direction: 'ltr', textAlign: isRTL ? 'right' : 'left' }}>{item.qty} × {item.product.price.toFixed(3)} ج.م/{item.product.unit}</div>
            </div>
          ))}
          <div style={{ borderTop: '1px dashed #000', margin: '8px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 3 }}><span>{tr.subtotal}</span><span style={{ fontFamily: 'monospace' }}>{fmt(tx.subtotal)}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}><span>{tr.vat}</span><span style={{ fontFamily: 'monospace' }}>{fmt(tx.tax)}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 15 }}><span>{tr.total}</span><span style={{ fontFamily: 'monospace' }}>{fmt(tx.total)}</span></div>
          <div style={{ borderTop: '1px dashed #000', margin: '8px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
            <span>{tr.paymentLabel} {tx.method === 'cash' ? (isRTL ? 'نقداً' : 'CASH') : (isRTL ? 'بطاقة' : 'CARD')}</span>
            <span style={{ fontFamily: 'monospace' }}>{tr.paid} {fmt(tx.paid)}</span>
          </div>
          {tx.method === 'cash' && tx.change > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}><span>{tr.change}</span><span style={{ fontFamily: 'monospace' }}>{fmt(tx.change)}</span></div>
          )}
          <div style={{ borderTop: '1px dashed #000', margin: '10px 0' }} />
          <div style={{ textAlign: 'center', fontSize: 10, color: '#555' }}>{tr.receiptThanks}</div>
          <div style={{ textAlign: 'center', fontSize: 10, color: '#555', marginTop: 4 }}>{tr.receiptReg}</div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '10px', background: '#252836', border: '1px solid #2e3145', borderRadius: 4, color: '#8a8680', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
            {tr.newOrder}
          </button>
          <button onClick={handlePrint} style={{ flex: 2, padding: '10px', background: '#f5a623', border: 'none', borderRadius: 4, color: '#0f1117', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
            {tr.printReceipt}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── History Modal ──
function HistoryModal({ transactions, onClose, fmt, lang, tr, isRTL }: { transactions: Transaction[]; onClose: () => void; fmt: (n: number) => string; lang: Lang; tr: any; isRTL: boolean }) {
  const todayTotal = transactions.reduce((s, t) => s + t.total, 0)
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: '#1a1d27', border: '1px solid #2e3145', borderRadius: 8, padding: 24, width: 480, maxHeight: '85vh', display: 'flex', flexDirection: 'column' }} dir={isRTL ? 'rtl' : 'ltr'}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <div style={{ fontWeight: 700, color: '#f5a623', fontSize: 14 }}>{tr.transactionHistory}</div>
            <div style={{ fontSize: 11, color: '#8a8680', marginTop: 2 }}>{tr.todaySales} <span style={{ fontFamily: 'monospace', color: '#f0ede8' }}>{fmt(todayTotal)}</span></div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#8a8680', cursor: 'pointer', fontSize: 18 }}>✕</button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {transactions.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#4a4760', padding: 40, fontSize: 13 }}>{tr.noTransactions}</div>
          ) : transactions.map(tx => (
            <div key={tx.id} style={{ padding: '12px 0', borderBottom: '1px solid #1e2130' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#8a8680', direction: 'ltr' }}>{tx.id}</span>
                <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: 13, color: '#f5a623' }}>{fmt(tx.total)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                <span style={{ color: '#c8c4bc' }}>{tx.items.length} {tr.items} · {tx.method === 'cash' ? (isRTL ? 'نقداً' : 'CASH') : (isRTL ? 'بطاقة' : 'CARD')}</span>
                <span style={{ color: '#8a8680', fontFamily: 'monospace', direction: 'ltr' }}>{tx.time.toLocaleTimeString(isRTL ? 'ar-KW' : 'en-GB')}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
