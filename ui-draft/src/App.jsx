import { useEffect, useRef, useState } from 'react'
import { Button, Input, RocoTheme } from 'rocokingdom-ui'
import { attributeColors, getEggGroupColor, getTierColor } from './colors'
import petPortraits from './petPortraits.json'
import { EggData } from './mygo'

async function getEggDataClient() {
  if (typeof window !== 'undefined' && typeof window.mygo?.call === 'function') return EggData
  if (import.meta.env.DEV) return (await import('./devEggData')).DevEggData
  throw new Error('Go 查询服务尚未连接')
}

function SearchIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="10.8" cy="10.8" r="6.6" /><path d="m16 16 4 4" /></svg>
}

function SettingsIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z" /><path d="m19.4 15 .1.1a1.7 1.7 0 0 1-2.4 2.4l-.1-.1a1.7 1.7 0 0 0-2.9 1.2v.2a1.7 1.7 0 0 1-3.4 0v-.2a1.7 1.7 0 0 0-2.9-1.2l-.1.1a1.7 1.7 0 0 1-2.4-2.4l.1-.1a1.7 1.7 0 0 0-1.2-2.9H4a1.7 1.7 0 0 1 0-3.4h.2a1.7 1.7 0 0 0 1.2-2.9l-.1-.1a1.7 1.7 0 0 1 2.4-2.4l.1.1a1.7 1.7 0 0 0 2.9-1.2V2a1.7 1.7 0 0 1 3.4 0v.2a1.7 1.7 0 0 0 2.9 1.2l.1-.1a1.7 1.7 0 0 1 2.4 2.4l-.1.1a1.7 1.7 0 0 0 1.2 2.9h.2a1.7 1.7 0 0 1 0 3.4h-.2a1.7 1.7 0 0 0-1.2 2.9Z" transform="translate(1 1) scale(.92)" /></svg>
}

function BackIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><path d="m12 19-7-7 7-7" /></svg>
}

function readPreference(key, fallback) {
  try {
    return window.localStorage.getItem(key) ?? fallback
  } catch {
    return fallback
  }
}

function savePreference(key, value) {
  try {
    window.localStorage.setItem(key, value)
  } catch {
    // Keep the current session usable when browser storage is unavailable.
  }
}

function SettingsPanel({ section, onSectionChange, onBack, uiScale, savedUiScale, onUiScaleChange, onUiScaleSave, forceSystemFont, onForceSystemFontChange }) {
  return (
    <div className="settings-shell">
      <aside className="settings-sidebar">
        <div className="settings-sidebar-heading">
          <div className="settings-sidebar-title-row">
            <button className="settings-back-button" onClick={onBack} aria-label="返回查询"><BackIcon /></button>
            <span>设置</span>
          </div>
          <p>管理蛋查查的使用偏好</p>
        </div>
        <nav className="settings-navigation" aria-label="设置分类">
          <button className={section === 'general' ? 'settings-nav-item active' : 'settings-nav-item'} onClick={() => onSectionChange('general')} aria-current={section === 'general' ? 'page' : undefined}>通用</button>
          <button className="settings-nav-item disabled" disabled><span>AI设置</span><small>建设中</small></button>
          <button className={section === 'about' ? 'settings-nav-item active' : 'settings-nav-item'} onClick={() => onSectionChange('about')} aria-current={section === 'about' ? 'page' : undefined}>关于</button>
        </nav>
      </aside>

      <main className="settings-main">
        {section === 'general' ? (
          <>
            <header className="settings-page-heading">
              <span>偏好设置</span>
              <h1>通用</h1>
              <p>调整应用的显示方式。</p>
            </header>
            <div className="settings-options">
              <section className="settings-option">
                <div className="settings-option-copy">
                  <h2>全局 UI 缩放调整</h2>
                  <p>统一调整页面、卡片和控件的显示大小。</p>
                </div>
                <div className="scale-setting">
                  <div className="scale-value-row">
                    <output htmlFor="ui-scale" aria-live="polite">{uiScale}%</output>
                    <Button className="scale-save-button" material="paper" variant="solid" size="small" disabled={uiScale === savedUiScale} style={{ '--rk-material-background': 'var(--rk-primary)', '--rk-material-color': 'var(--rk-on-primary)' }} onClick={onUiScaleSave}>保存</Button>
                  </div>
                  <input id="ui-scale" type="range" min="80" max="120" step="5" value={uiScale} onChange={onUiScaleChange} aria-label="全局 UI 缩放" aria-valuetext={`${uiScale}%`} />
                  <div className="scale-markers" aria-hidden="true"><span>80%</span><span>100%</span><span>120%</span></div>
                  <span className="scale-save-hint">{uiScale === savedUiScale ? '调整后保存，再应用缩放' : '缩放值尚未保存'}</span>
                </div>
              </section>
              <label className="settings-option system-font-option" htmlFor="force-system-font">
                <span className="settings-option-copy">
                  <span className="settings-option-title">强制字体为系统默认字体</span>
                  <span className="settings-option-description">忽略主题字体，使用当前设备的系统字体。</span>
                </span>
                <span className="settings-switch">
                  <input id="force-system-font" type="checkbox" checked={forceSystemFont} onChange={onForceSystemFontChange} />
                  <i aria-hidden="true" />
                </span>
              </label>
            </div>
          </>
        ) : (
          <section className="settings-about">
            <img src="/empty-placeholder.png" alt="蛋查查图标" />
            <h1>蛋查查</h1>
            <p className="settings-about-english">NCR Egg Check</p>
          </section>
        )}
      </main>
    </div>
  )
}

function formatKg(value) {
  return `${(value / 1000).toFixed(3)} kg`
}

function getPetAttributes(pet) {
  const attributes = pet.attributes ?? pet.attrs ?? pet.types
  if (Array.isArray(attributes)) return attributes.filter(Boolean)
  return [pet.attr1, pet.attr2].filter(Boolean)
}

function EggWeightScale({ weight }) {
  const span = Math.max(weight.max - weight.min, 1)
  const toPercent = (value) => Math.min(100, Math.max(0, ((value - weight.min) / span) * 100))
  const segmentStyle = (start, end) => {
    const minimumWidth = 0.8
    const left = Math.min(toPercent(start), 100 - minimumWidth)
    const width = Math.min(Math.max(toPercent(end) - toPercent(start), minimumWidth), 100 - left)
    return { left: `${left}%`, width: `${width}%` }
  }
  const miniEnd = toPercent(weight.mini_max)
  const hugeStart = toPercent(weight.huge_min)
  const miniRange = `${formatKg(weight.min)} – ${formatKg(weight.mini_max)}`
  const hugeRange = `${formatKg(weight.huge_min)} – ${formatKg(weight.max)}`

  return (
    <div className="pet-weight">
      <div className="weight-range-heading">
        <span className="weight-label">精灵蛋重量范围</span>
      </div>
      <div
        className="egg-weight-scale"
        role="img"
        aria-label={`精灵蛋重量范围 ${formatKg(weight.min)} 到 ${formatKg(weight.max)}；迷你蛋 ${miniRange}；巨大蛋 ${hugeRange}`}
        title={`迷你蛋：${miniRange}；巨大蛋：${hugeRange}`}
      >
        <span className="egg-weight-total" />
        <span className="egg-weight-segment egg-weight-mini" style={segmentStyle(weight.min, weight.mini_max)} />
        <span className="egg-weight-segment egg-weight-huge" style={segmentStyle(weight.huge_min, weight.max)} />
        <span className="egg-weight-boundary egg-weight-mini-boundary" style={{ left: `${miniEnd}%` }} />
        <span className="egg-weight-boundary egg-weight-huge-boundary" style={{ left: `${hugeStart}%` }} />
      </div>
      <div className="weight-scale-labels"><span>{formatKg(weight.min)}</span><span>{formatKg(weight.max)}</span></div>
      <div className="weight-intervals">
        <div className="weight-interval">
          <span className="weight-interval-label"><i className="weight-legend weight-legend-mini" />迷你蛋</span>
          <strong>{miniRange}</strong>
        </div>
        <div className="weight-interval">
          <span className="weight-interval-label"><i className="weight-legend weight-legend-huge" />巨大蛋</span>
          <strong>{hugeRange}</strong>
        </div>
      </div>
    </div>
  )
}

function App() {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [settingsSection, setSettingsSection] = useState('general')
  const [uiScale, setUiScale] = useState(() => {
    const stored = Number(readPreference('ncr-egg-check.ui-scale', '100'))
    return Number.isFinite(stored) && stored >= 80 && stored <= 120 ? stored : 100
  })
  const [uiScaleDraft, setUiScaleDraft] = useState(uiScale)
  const [forceSystemFont, setForceSystemFont] = useState(() => readPreference('ncr-egg-check.system-font', 'false') === 'true')
  const [keyword, setKeyword] = useState('')
  const [minTier, setMinTier] = useState(1)
  const [maxTier, setMaxTier] = useState(10)
  const [groups, setGroups] = useState([])
  const [selectedAttributes, setSelectedAttributes] = useState([])
  const [eggGroups, setEggGroups] = useState([])
  const [eggDataClient, setEggDataClient] = useState(null)
  const [results, setResults] = useState([])
  const [isEditingTierRange, setIsEditingTierRange] = useState(false)
  const [tierRangeDraft, setTierRangeDraft] = useState('')
  const [tierRangeError, setTierRangeError] = useState(false)
  const cancelTierRangeBlur = useRef(false)
  const hasTierFilter = minTier > 1 || maxTier < 10
  const hasFilters = Boolean(keyword.trim() || hasTierFilter || groups.length || selectedAttributes.length)

  useEffect(() => {
    let cancelled = false
    getEggDataClient().then(async (client) => {
      const nextGroups = await client.getEggGroups()
      if (!cancelled) {
        setEggDataClient(client)
        setEggGroups(nextGroups)
      }
    }).catch((error) => {
      console.error('无法读取蛋组列表', error)
    })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    let cancelled = false
    if (!hasFilters) {
      setResults([])
      return () => { cancelled = true }
    }
    if (!eggDataClient) return () => { cancelled = true }

    eggDataClient.query({ keyword, minTier, maxTier, eggGroups: groups, attributes: selectedAttributes })
      .then((nextResults) => {
        if (!cancelled) setResults(nextResults)
      })
      .catch((error) => {
        if (!cancelled) {
          console.error('精灵查询失败', error)
          setResults([])
        }
      })
    return () => { cancelled = true }
  }, [eggDataClient, hasFilters, keyword, minTier, maxTier, groups, selectedAttributes])

  const resultPetCount = results.length
  const rangeLeft = ((minTier - 1) / 9) * 100
  const rangeWidth = ((maxTier - minTier) / 9) * 100
  const rangeLabel = minTier === 1 && maxTier === 10
    ? '全部档位'
    : minTier === maxTier ? `${minTier} 档` : `${minTier}–${maxTier} 档`

  function openTierRangeEditor() {
    cancelTierRangeBlur.current = false
    setTierRangeDraft(minTier === maxTier ? `${minTier}` : `${minTier}-${maxTier}`)
    setTierRangeError(false)
    setIsEditingTierRange(true)
  }

  function cancelTierRangeEdit() {
    cancelTierRangeBlur.current = true
    setTierRangeError(false)
    setIsEditingTierRange(false)
  }

  function commitTierRangeEdit() {
    if (cancelTierRangeBlur.current) {
      cancelTierRangeBlur.current = false
      return
    }

    const match = tierRangeDraft.trim().match(/^(10|[1-9])(?:\s*[-–—]\s*(10|[1-9]))?$/)
    if (!match) {
      setTierRangeError(true)
      return
    }

    const firstTier = Number(match[1])
    const secondTier = match[2] ? Number(match[2]) : firstTier
    setMinTier(Math.min(firstTier, secondTier))
    setMaxTier(Math.max(firstTier, secondTier))
    setTierRangeError(false)
    setIsEditingTierRange(false)
  }

  function resetTierRange() {
    cancelTierRangeBlur.current = true
    setMinTier(1)
    setMaxTier(10)
    setTierRangeError(false)
    setIsEditingTierRange(false)
  }

  function updateMinTier(event) {
    const value = Number(event.target.value)
    if (value > maxTier) setMaxTier(value)
    setMinTier(value)
  }

  function updateMaxTier(event) {
    const value = Number(event.target.value)
    if (value < minTier) setMinTier(value)
    setMaxTier(value)
  }

  function toggleGroup(group) {
    setGroups((current) => {
      if (current.includes(group)) return current.filter((item) => item !== group)
      return [...current, group]
    })
  }

  function toggleAttribute(attribute) {
    setSelectedAttributes((current) => {
      if (current.includes(attribute)) return current.filter((item) => item !== attribute)
      return [...current, attribute]
    })
  }

  function changeUiScale(event) {
    setUiScaleDraft(Number(event.target.value))
  }

  function saveUiScale() {
    setUiScale(uiScaleDraft)
    savePreference('ncr-egg-check.ui-scale', String(uiScaleDraft))
  }

  function changeSystemFont(event) {
    const enabled = event.target.checked
    setForceSystemFont(enabled)
    savePreference('ncr-egg-check.system-font', String(enabled))
  }

  return (
    <RocoTheme className="app-theme">
      <div className={`scaled-app${forceSystemFont ? ' force-system-font' : ''}`} style={{ zoom: uiScale / 100, width: `${10000 / uiScale}%`, '--app-scale': uiScale / 100, '--app-viewport-height': `${10000 / uiScale}vh` }}>
        {settingsOpen ? (
          <SettingsPanel
            section={settingsSection}
            onSectionChange={setSettingsSection}
            onBack={() => setSettingsOpen(false)}
            uiScale={uiScaleDraft}
            savedUiScale={uiScale}
            onUiScaleChange={changeUiScale}
            onUiScaleSave={saveUiScale}
            forceSystemFont={forceSystemFont}
            onForceSystemFontChange={changeSystemFont}
          />
        ) : <div className="app-shell">
        <aside className="filters-sidebar">
          <section className="filter-section search-section">
            <Input
              rootClassName="search-input"
              inputClassName="search-native"
              material="paper"
              size="large"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="名称或图鉴编号"
              aria-label="搜索名称或图鉴编号"
              prefix={<SearchIcon />}
            />
          </section>

          <section className="filter-section tier-section">
            <div className="section-heading">
              <h2>档位筛选</h2>
              <div className="tier-heading-actions">
                {isEditingTierRange ? (
                  <input
                    className="current-range current-range-input"
                    type="text"
                    inputMode="text"
                    value={tierRangeDraft}
                    aria-label="输入档位或档位范围，例如 2 或 2-3"
                    aria-invalid={tierRangeError}
                    aria-describedby={tierRangeError ? 'tier-range-error' : undefined}
                    autoFocus
                    onChange={(event) => { setTierRangeDraft(event.target.value); setTierRangeError(false) }}
                    onFocus={(event) => event.currentTarget.select()}
                    onBlur={commitTierRangeEdit}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault()
                        commitTierRangeEdit()
                      }
                      if (event.key === 'Escape') {
                        event.preventDefault()
                        cancelTierRangeEdit()
                      }
                    }}
                  />
                ) : (
                  <strong
                    className="current-range current-range-editable"
                    role="button"
                    tabIndex={0}
                    title="双击编辑档位范围"
                    aria-label={`当前档位范围：${rangeLabel}。双击或按回车编辑`}
                    onDoubleClick={openTierRangeEditor}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        openTierRangeEditor()
                      }
                    }}
                  >{rangeLabel}</strong>
                )}
                <Button className="filter-reset" material="paper" variant="text" size="small" disabled={!hasTierFilter} onClick={resetTierRange}>重置</Button>
              </div>
            </div>
            {tierRangeError && <p className="range-input-error" id="tier-range-error" role="alert">请输入 1–10，或范围如 2-3</p>}
            <div className="range-control">
              <div className="range-track" />
              <div className="range-selected" style={{ left: `${rangeLeft}%`, width: `${rangeWidth}%` }} />
              <input type="range" min="1" max="10" step="1" value={minTier} onChange={updateMinTier} aria-label="最低档位" />
              <input type="range" min="1" max="10" step="1" value={maxTier} onChange={updateMaxTier} aria-label="最高档位" />
            </div>
            <div className="range-ticks" aria-hidden="true">{Array.from({ length: 10 }, (_, index) => <span key={index}>{index + 1}</span>)}</div>
          </section>

          <section className="filter-section group-section">
            <div className="section-heading">
              <h2>蛋组筛选</h2>
              <Button className="filter-reset" material="paper" variant="text" size="small" disabled={!groups.length} onClick={() => setGroups([])}>重置</Button>
            </div>
            <div className="group-options">
              {eggGroups.map((group) => {
                const selected = groups.includes(group)
                const color = getEggGroupColor(group)
                return <Button
                  key={group}
                  className="group-button"
                  size="small"
                  material="paper"
                  variant="solid"
                  style={{
                    '--rk-material-background': selected ? color : 'var(--rk-paper)',
                    '--rk-material-color': selected ? '#ffffff' : 'var(--rk-on-paper)',
                  }}
                  aria-pressed={selected}
                  onClick={() => toggleGroup(group)}
                >{group}</Button>
              })}
            </div>
          </section>

          <section className="filter-section attribute-section">
            <div className="section-heading">
              <h2>属性筛选</h2>
              <Button className="filter-reset" material="paper" variant="text" size="small" disabled={!selectedAttributes.length} onClick={() => setSelectedAttributes([])}>重置</Button>
            </div>
            <div className="attribute-options">
              {Object.entries(attributeColors).map(([attribute, color]) => {
                const selected = selectedAttributes.includes(attribute)
                return <Button
                  key={attribute}
                  className="attribute-button"
                  size="small"
                  material="paper"
                  variant="solid"
                  style={{
                    '--rk-material-background': selected ? color : 'var(--rk-paper)',
                    '--rk-material-color': selected ? '#ffffff' : 'var(--rk-on-paper)',
                    '--attribute-color': color,
                  }}
                  aria-pressed={selected}
                  onClick={() => toggleAttribute(attribute)}
                ><img src={`/attributes/${encodeURIComponent(attribute)}.webp`} alt="" />{attribute}</Button>
              })}
            </div>
          </section>
          <Button className="sidebar-settings-button" material="paper" variant="solid" size="large" style={{ '--rk-material-background': 'var(--rk-primary)', '--rk-material-color': 'var(--rk-on-primary)' }} onClick={() => setSettingsOpen(true)}><SettingsIcon />设置</Button>
        </aside>

        <main className="results-main">
          {!hasFilters ? (
            <div className="initial-empty">
              <img src="/empty-placeholder.png" alt="等待筛选条件的占位图" />
              <h2>选择筛选条件开始查询</h2>
              <p>从左侧输入名称，或调整档位、蛋组和属性。</p>
            </div>
          ) : (
            <>
              <header className="results-header">
                <div><span className="results-kicker">查询结果</span><h2>匹配精灵</h2></div>
                <div className="results-count"><strong>{resultPetCount}</strong><span>只精灵</span></div>
              </header>
              {results.length ? (
                <div className="result-grid" role="list">
                  {results.map((pet) => {
                    const tierColor = getTierColor(pet.egg_weight.tier)
                    const petAttributes = getPetAttributes(pet)
                    return <article className="pet-card" role="listitem" key={pet.id}>
                      <header className="pet-card-header">
                        <div className="pet-card-identity">
                          {petPortraits[pet.id] && <img className="pet-avatar" src={petPortraits[pet.id]} alt="" loading="lazy" decoding="async" />}
                          <div className="pet-name">
                            <span className="pet-number">NO. {pet.number}</span>
                            <strong>{pet.name}</strong>
                            <div className="pet-attributes">
                              {petAttributes.map((attribute) => <span className="pet-attribute" key={`attribute-${attribute}`} style={{ '--attribute-color': attributeColors[attribute] ?? '#666666' }}><span className="pet-attribute-content"><img src={`/attributes/${encodeURIComponent(attribute)}.webp`} alt="" />{attribute}</span></span>)}
                            </div>
                          </div>
                        </div>
                        <div className="pet-tier" style={{ background: tierColor.background, color: tierColor.foreground }}><strong>{pet.egg_weight.tier} 档</strong><span>{pet.egg_weight.tier_label}</span></div>
                      </header>
                      <div className="pet-groups">
                        {pet.egg_groups.map((group) => <span key={`group-${group}`} style={{ background: getEggGroupColor(group), color: '#ffffff' }}>{group}</span>)}
                      </div>
                      <EggWeightScale weight={pet.egg_weight} />
                    </article>
                  })}
                </div>
              ) : (
                <div className="no-results"><img src="/empty-placeholder.png" alt="没有匹配结果" /><strong>没有找到匹配精灵</strong><span>试试放宽档位范围或减少筛选条件。</span></div>
              )}
            </>
          )}
        </main>
        </div>}
      </div>
    </RocoTheme>
  )
}

export default App
