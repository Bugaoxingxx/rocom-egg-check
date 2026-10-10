import { useEffect, useState } from 'react'
import { Button, Input, Panel, RocoShape, Select } from 'rocokingdom-ui'

const EPSILON = 1e-9
const BIG_THRESHOLD = 98
const SMALL_THRESHOLD = 2
const MAX_GENERATIONS = 100
export const SAVED_CALCULATIONS_KEY = 'rocom-egg-check.offspring-calculations'

function PencilIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m15 5 4 4M4 20l4.3-.9L19 8.4a2.1 2.1 0 0 0-3-3L5.3 16.1 4 20Z" /><path d="M13.5 6.5 17.5 10.5" /></svg>
}

function parseValue(value) {
  const parsed = Number.parseFloat(value)
  return Number.isFinite(parsed) ? parsed : Number.NaN
}

function formatPercent(value) {
  return Number.isFinite(value) ? `${value.toFixed(2)}%` : '—'
}

function formatSoundValue(value) {
  return Number.isFinite(value) ? String(Math.floor(value)) : '—'
}

function parseSoundValue(value) {
  const parsed = parseValue(value)
  return Number.isFinite(parsed) ? Math.floor(parsed) : Number.NaN
}

function readSavedCalculations() {
  try {
    const saved = JSON.parse(window.localStorage.getItem(SAVED_CALCULATIONS_KEY) ?? '[]')
    return Array.isArray(saved) ? saved : []
  } catch {
    return []
  }
}

function isBigHit(value) {
  return value > BIG_THRESHOLD + EPSILON
}

function isSmallHit(value) {
  return value < SMALL_THRESHOLD - EPSILON
}

function sideName(side) {
  return side === 'father' ? '父本' : '母本'
}

function medalName(medal) {
  return medal === 'big' ? '大块头' : medal === 'small' ? '小不点' : '（无）'
}

function pureReachGeneration(anchor, other, medal) {
  const hit = medal === 'big' ? isBigHit : isSmallHit
  for (let generation = 1; generation <= 400; generation += 1) {
    const theoretical = anchor + (other - anchor) / (2 ** generation)
    if (hit(theoretical)) return generation
  }
  return null
}

function decideTarget(father, mother) {
  const bigSide = father >= mother ? 'father' : 'mother'
  const smallSide = father <= mother ? 'father' : 'mother'
  const canReachBig = Math.max(father, mother) > BIG_THRESHOLD + EPSILON
  const canReachSmall = Math.min(father, mother) < SMALL_THRESHOLD - EPSILON

  if (canReachBig && canReachSmall) {
    const bigGenerations = pureReachGeneration(Math.max(father, mother), Math.min(father, mother), 'big')
    const smallGenerations = pureReachGeneration(Math.min(father, mother), Math.max(father, mother), 'small')
    if (bigGenerations !== null && (smallGenerations === null || bigGenerations <= smallGenerations)) {
      return { medal: 'big', anchor: bigSide }
    }
    return { medal: 'small', anchor: smallSide }
  }
  if (canReachBig) return { medal: 'big', anchor: bigSide }
  if (canReachSmall) return { medal: 'small', anchor: smallSide }
  return { medal: 'none', anchor: null }
}

function chooseAnchor(father, mother, medal, preference) {
  if (preference !== 'auto') return preference
  if (medal === 'big') return father >= mother ? 'father' : 'mother'
  if (medal === 'small') return father <= mother ? 'father' : 'mother'
  return null
}

function buildRows(anchor, other, medal, actualValues) {
  const hit = medal === 'big' ? isBigHit : isSmallHit
  const rows = []
  let usedForBreeding = other
  let reachGeneration = null

  for (let generation = 1; generation <= MAX_GENERATIONS; generation += 1) {
    const theoretical = (anchor + usedForBreeding) / 2
    const actual = parseValue(actualValues[generation])
    const hasActual = Number.isFinite(actual)
    const judge = hasActual ? actual : theoretical
    rows.push({ generation, theoretical, actual: hasActual ? actual : null, judge })
    if (hit(judge)) {
      reachGeneration = generation
      break
    }
    usedForBreeding = judge
  }

  return { rows, reachGeneration }
}

function buildSoundRows(anchor, other, count) {
  const rows = []
  let previous = other
  for (let generation = 1; generation <= count; generation += 1) {
    const value = Math.floor((anchor + previous) / 2)
    rows.push(value)
    previous = value
  }
  return rows
}

function MedalBadge({ value }) {
  const style = isBigHit(value)
    ? { background: 'var(--rk-primary)', color: 'var(--rk-on-primary)' }
    : isSmallHit(value)
      ? { background: 'var(--rk-stone-soft)', color: 'var(--rk-on-stone)' }
      : { background: 'var(--rk-paper-muted)', color: 'var(--rk-on-paper)' }
  const label = isBigHit(value) ? '大块头' : isSmallHit(value) ? '小不点' : '未达标'
  return <RocoShape className="offspring-calc-badge" background={style.background} color={style.color}>{label}</RocoShape>
}

function FloatingValue({ theoretical, actual }) {
  if (!Number.isFinite(actual)) return <span className="offspring-calc-float none">—</span>
  const difference = actual - theoretical
  const value = `${difference > 0 ? '+' : ''}${difference.toFixed(2)}%`
  const tone = difference > 0 ? 'pos' : difference < 0 ? 'neg' : 'zero'
  return <span className={`offspring-calc-float ${tone}`}>{value}</span>
}

function SummaryCard({ label, value }) {
  return (
    <Panel className="offspring-calc-stat" contentClassName="offspring-calc-stat-content" material="paperSoft">
      <span className="offspring-calc-stat-label">{label}</span>
      <strong className="offspring-calc-stat-value">{value}</strong>
    </Panel>
  )
}

const STATUS_OPTIONS = [
  { value: 'in_progress', label: '迭代中' },
  { value: 'completed', label: '迭代完成' },
  { value: 'abandoned', label: '放弃迭代' },
]

function StatusTags({ value, onChange, disabled = false, className = '' }) {
  return (
    <div className={`offspring-calc-status-tags ${className}`.trim()} role="group" aria-label="迭代状态">
      {STATUS_OPTIONS.map((option) => (
        <button
          aria-pressed={value === option.value}
          className={`offspring-calc-status-tag ${option.value}${value === option.value ? ' active' : ''}`}
          disabled={disabled}
          key={option.value}
          onClick={() => onChange(option.value)}
          type="button"
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

function SavedCalculationCard({ record, onOpen, onDelete, onStatusChange }) {
  const created = new Date(record.updatedAt ?? record.createdAt).toLocaleString('zh-CN', {
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
  })

  return (
    <Panel as="article" className="offspring-calc-saved-card" contentClassName="offspring-calc-saved-card-content" material="paperSoft">
      <div className="offspring-calc-saved-card-info">
        <strong>{record.name || '未命名计算'}</strong>
        <span>{record.medalLabel} · {record.generationCount ? `${record.generationCount} 代` : record.medalLabel === '（无）' ? '暂无可达路径' : '等待输入'} · {created}</span>
      </div>
      <div className="offspring-calc-saved-card-actions">
        <StatusTags value={record.status ?? 'in_progress'} onChange={(value) => onStatusChange(record.id, value)} className="saved-card-tags" />
        <div className="offspring-calc-saved-card-buttons">
          <Button className="offspring-calc-open-button" material="default" size="small" onClick={() => onOpen(record.id)}>打开</Button>
          <Button className="offspring-calc-list-delete-button" material="default" size="small" style={{ '--rk-material-background': 'var(--rk-danger)', '--rk-material-color': '#fff' }} onClick={() => onDelete(record.id)}>删除</Button>
        </div>
      </div>
    </Panel>
  )
}

function ResultNote({ tone, children }) {
  const materialStyle = tone === 'ok'
    ? { '--rk-material-background': 'var(--rk-success)', '--rk-material-color': 'var(--rk-on-success)' }
    : tone === 'warn'
      ? { '--rk-material-background': 'var(--rk-danger)', '--rk-material-color': 'var(--rk-on-danger)' }
      : { '--rk-material-background': 'var(--rk-paper-muted)', '--rk-material-color': 'var(--rk-on-paper)' }
  return (
    <Panel className={`offspring-calc-note ${tone}`} contentClassName="offspring-calc-note-content" curve="top" curveInset="18px" material="paperSoft" style={materialStyle}>
      {children}
    </Panel>
  )
}

export default function OffspringCalculator({ notify }) {
  const [fatherValue, setFatherValue] = useState('')
  const [motherValue, setMotherValue] = useState('')
  const [fatherSoundValue, setFatherSoundValue] = useState('')
  const [motherSoundValue, setMotherSoundValue] = useState('')
  const [soundEnabled, setSoundEnabled] = useState(false)
  const [medalSetting, setMedalSetting] = useState('auto')
  const [anchorSetting, setAnchorSetting] = useState('auto')
  const [actualValues, setActualValues] = useState({})
  const [calculationName, setCalculationName] = useState('')
  const [savedRecords, setSavedRecords] = useState(readSavedCalculations)
  const [activeSavedId, setActiveSavedId] = useState(null)
  const [view, setView] = useState('editor')
  const [renaming, setRenaming] = useState(false)
  useEffect(() => {
    try {
      window.localStorage.setItem(SAVED_CALCULATIONS_KEY, JSON.stringify(savedRecords))
    } catch {
      // Keep the current session usable when browser storage is unavailable.
    }
  }, [savedRecords])

  useEffect(() => {
    const handleImportedCalculations = (event) => {
      if (Array.isArray(event.detail)) setSavedRecords(event.detail)
    }
    window.addEventListener('rocom-egg-check:offspring-calculations-imported', handleImportedCalculations)
    return () => window.removeEventListener('rocom-egg-check:offspring-calculations-imported', handleImportedCalculations)
  }, [])

  const father = parseValue(fatherValue)
  const mother = parseValue(motherValue)
  const fatherSound = parseSoundValue(fatherSoundValue)
  const motherSound = parseSoundValue(motherSoundValue)
  const hasParents = Number.isFinite(father) && Number.isFinite(mother)
  const hasSoundParents = soundEnabled && Number.isFinite(fatherSound) && Number.isFinite(motherSound)
  const automaticTarget = hasParents ? decideTarget(father, mother) : { medal: 'none', anchor: null }
  const selectedMedal = medalSetting === 'auto' ? automaticTarget.medal : medalSetting
  const target = hasParents
    ? { medal: selectedMedal, anchor: chooseAnchor(father, mother, selectedMedal, anchorSetting) }
    : { medal: 'none', anchor: null }
  const anchor = target.anchor === 'father' ? father : mother
  const other = target.anchor === 'father' ? mother : father
  const simulation = hasParents && target.medal !== 'none'
    ? buildRows(anchor, other, target.medal, actualValues)
    : { rows: [], reachGeneration: null }
  const soundRows = hasSoundParents && simulation.rows.length > 0
    ? buildSoundRows(target.anchor === 'father' ? fatherSound : motherSound, target.anchor === 'father' ? motherSound : fatherSound, simulation.rows.length)
    : []
  const anyActual = simulation.rows.some((row) => row.actual !== null)
  const firstTheoretical = hasParents ? (father + mother) / 2 : Number.NaN
  const activeSavedRecord = savedRecords.find((record) => record.id === activeSavedId)
  const liveStatus = simulation.reachGeneration !== null ? 'completed' : 'in_progress'
  const displayedStatus = activeSavedRecord
    ? !activeSavedRecord.statusManuallySet && simulation.reachGeneration !== null
      ? 'completed'
      : !activeSavedRecord.statusManuallySet && activeSavedRecord.autoCompleted && simulation.reachGeneration === null
        ? 'in_progress'
        : activeSavedRecord.status ?? liveStatus
    : liveStatus

  const setParentValue = (setter) => (event) => {
    setter(event.target.value)
  }
  const setSoundValue = (setter) => (event) => {
    const value = event.target.value
    setter(value === '' ? '' : String(parseSoundValue(value)))
  }
  const setActualValue = (generation, value) => {
    setActualValues((current) => ({ ...current, [generation]: value }))
  }
  const openSavedCalculation = (id) => {
    const record = savedRecords.find((item) => item.id === id)
    if (!record) return
    setFatherValue(record.fatherValue ?? '')
    setMotherValue(record.motherValue ?? '')
    setFatherSoundValue(record.fatherSoundValue ?? '')
    setMotherSoundValue(record.motherSoundValue ?? '')
    setSoundEnabled(Boolean(record.soundEnabled))
    setMedalSetting(record.medalSetting ?? 'auto')
    setAnchorSetting(record.anchorSetting ?? 'auto')
    setActualValues(record.actualValues ?? {})
    setCalculationName(record.name ?? '')
    setActiveSavedId(record.id)
    setRenaming(false)
    setView('detail')
  }
  const showSavedList = () => {
    if (view === 'saved-list') return
    setFatherValue('')
    setMotherValue('')
    setFatherSoundValue('')
    setMotherSoundValue('')
    setSoundEnabled(false)
    setMedalSetting('auto')
    setAnchorSetting('auto')
    setActualValues({})
    setCalculationName('')
    setActiveSavedId(null)
    setRenaming(false)
    setView('saved-list')
  }
  const showCalculator = () => setView('editor')
  const updateSavedStatus = (id, status) => {
    setSavedRecords((records) => records.map((record) => {
      if (record.id !== id) return record
      return { ...record, status, autoCompleted: false, statusManuallySet: true, updatedAt: Date.now() }
    }))
  }
  const deleteSavedCalculation = (id) => {
    const record = savedRecords.find((item) => item.id === id)
    if (!record) return
    const title = record.name || '未命名计算'
    if (!window.confirm(`确定删除“${title}”吗？此操作无法撤销。`)) return
    setSavedRecords((records) => records.filter((item) => item.id !== id))
    notify('计算已删除')
  }
  const updateActiveStatus = (status) => {
    if (activeSavedId) updateSavedStatus(activeSavedId, status)
  }
  const commitRename = () => {
    if (!activeSavedId) {
      setRenaming(false)
      return
    }
    const name = calculationName.trim()
    setSavedRecords((records) => records.map((record) => record.id === activeSavedId
      ? { ...record, name, updatedAt: Date.now() }
      : record))
    setCalculationName(name)
    notify('名称已更新')
    setRenaming(false)
  }
  const deleteCurrentCalculation = () => {
    const record = savedRecords.find((item) => item.id === activeSavedId)
    const title = record?.name || (activeSavedId ? '未命名计算' : calculationName.trim() || '当前未保存计算')
    if (!window.confirm(`确定删除“${title}”吗？此操作无法撤销。`)) return
    if (activeSavedId) setSavedRecords((records) => records.filter((item) => item.id !== activeSavedId))
    if (record) notify('计算已删除')
    setFatherValue('')
    setMotherValue('')
    setFatherSoundValue('')
    setMotherSoundValue('')
    setSoundEnabled(false)
    setMedalSetting('auto')
    setAnchorSetting('auto')
    setActualValues({})
    setCalculationName('')
    setActiveSavedId(null)
    setRenaming(false)
    setView(activeSavedId ? 'saved-list' : view)
  }
  const saveCurrentResult = () => {
    if (!hasParents) return
    const now = Date.now()
    const existing = savedRecords.find((record) => record.id === activeSavedId)
    const id = existing?.id ?? globalThis.crypto?.randomUUID?.() ?? `calculation-${now}`
    const name = calculationName.trim()
    const autoCompleted = simulation.reachGeneration !== null
    const record = {
      id,
      name,
      fatherValue,
      motherValue,
      fatherSoundValue,
      motherSoundValue,
      soundEnabled,
      medalSetting,
      anchorSetting,
      actualValues,
      medalLabel: medalName(target.medal),
      generationCount: simulation.rows.length,
      reachGeneration: simulation.reachGeneration,
      autoCompleted,
      status: autoCompleted ? 'completed' : existing?.autoCompleted ? 'in_progress' : existing?.status ?? 'in_progress',
      statusManuallySet: autoCompleted ? false : existing?.statusManuallySet ?? false,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    }
    setSavedRecords((records) => existing
      ? records.map((item) => item.id === id ? record : item)
      : [record, ...records])
    setActiveSavedId(id)
    setCalculationName(name)
    notify(existing ? '计算已更新' : '计算已新建')
    setRenaming(false)
    setView('detail')
  }

  const displayRows = simulation.rows

  let resultNote = null
  if (hasParents && target.medal === 'none') {
    resultNote = <ResultNote tone="warn">当前亲本无法按理论值达成奖牌。大块头需要固定亲本高于 98.00%，小不点需要固定亲本低于 2.00%。</ResultNote>
  } else if (hasParents && simulation.reachGeneration !== null) {
    const finalRow = simulation.rows[simulation.rows.length - 1]
    const source = finalRow.actual !== null ? '实测值' : '理论值'
    const reachedValue = finalRow.actual ?? finalRow.theoretical
    resultNote = (
      <ResultNote tone="ok">
        固定<strong>{sideName(target.anchor)}</strong>迭代，第 <strong>{simulation.reachGeneration}</strong> 代{source} <strong>{formatPercent(reachedValue)}</strong> 达标（{medalName(target.medal)}）。共需繁育 <strong>{simulation.reachGeneration}</strong> 代。
      </ResultNote>
    )
  } else if (hasParents && anyActual) {
    resultNote = <ResultNote tone="warn">按当前已填写的实测值，迭代 {simulation.rows.length} 代仍未达标（{medalName(target.medal)}）。</ResultNote>
  } else if (hasParents) {
    const limitDescription = target.medal === 'big' ? '不会超过' : '不会低于'
    resultNote = (
      <ResultNote tone="warn">
        固定{sideName(target.anchor)}迭代时，理论值只会无限逼近 {formatPercent(anchor)}（{limitDescription}），未填写实测值时无法达到{medalName(target.medal)}阈值；可填写实测体重后继续迭代。
      </ResultNote>
    )
  }

  return (
    <div className="app-shell offspring-calc-shell">
      <aside className="offspring-calc-sidebar">
        <section className="offspring-calc-control-section">
          <h2>亲本体重</h2>
          <label className="offspring-calc-field">
            <span>父本体重百分比 (%)</span>
            <Input rootClassName="offspring-calc-input" inputClassName="offspring-calc-input-control" material="paperSoft" size="middle" type="number" min="0" max="100" step="0.01" inputMode="decimal" placeholder="如 89.00" value={fatherValue} onChange={setParentValue(setFatherValue)} />
          </label>
          <label className="offspring-calc-field">
            <span>母本体重百分比 (%)</span>
            <Input rootClassName="offspring-calc-input" inputClassName="offspring-calc-input-control" material="paperSoft" size="middle" type="number" min="0" max="100" step="0.01" inputMode="decimal" placeholder="如 99.00" value={motherValue} onChange={setParentValue(setMotherValue)} />
          </label>
          <div className="offspring-calc-sound-switch-row">
            <div><strong>声音值</strong></div>
            <label className="offspring-calc-switch">
              <input type="checkbox" role="switch" aria-label="启用声音值" checked={soundEnabled} onChange={(event) => setSoundEnabled(event.target.checked)} />
              <span aria-hidden="true" />
            </label>
          </div>
          {soundEnabled && (
            <div className="offspring-calc-sound-fields">
              <label className="offspring-calc-field">
                <span>父本声音值</span>
                <Input rootClassName="offspring-calc-input" inputClassName="offspring-calc-input-control" material="paperSoft" size="middle" type="number" min="0" step="1" inputMode="numeric" placeholder="输入父本声音值" value={fatherSoundValue} onChange={setSoundValue(setFatherSoundValue)} />
              </label>
              <label className="offspring-calc-field">
                <span>母本声音值</span>
                <Input rootClassName="offspring-calc-input" inputClassName="offspring-calc-input-control" material="paperSoft" size="middle" type="number" min="0" step="1" inputMode="numeric" placeholder="输入母本声音值" value={motherSoundValue} onChange={setSoundValue(setMotherSoundValue)} />
              </label>
            </div>
          )}
        </section>

        <section className="offspring-calc-control-section">
          <h2>奖牌设置</h2>
          <label className="offspring-calc-select-field">
            <span>目标奖牌</span>
            <Select rootClassName="offspring-calc-select" triggerClassName="offspring-calc-select-trigger" material="paperSoft" value={medalSetting} onValueChange={setMedalSetting} ariaLabel="目标奖牌" options={[
              { value: 'auto', label: '自动选择' },
              { value: 'big', label: '大块头（> 98%）' },
              { value: 'small', label: '小不点（< 2%）' },
            ]} />
          </label>
          <label className="offspring-calc-select-field">
            <span>固定亲本</span>
            <Select rootClassName="offspring-calc-select" triggerClassName="offspring-calc-select-trigger" material="paperSoft" value={anchorSetting} onValueChange={setAnchorSetting} ariaLabel="固定亲本" options={[
              { value: 'auto', label: '按奖牌自动推荐' },
              { value: 'father', label: '固定父本' },
              { value: 'mother', label: '固定母本' },
            ]} />
          </label>
        </section>

        <div className="offspring-calc-sidebar-actions">
          {activeSavedRecord && view !== 'saved-list'
            ? <Button className="offspring-calc-save-button" material="default" shadow disabled={!hasParents} onClick={saveCurrentResult}>保存更改</Button>
            : hasParents && <Button className="offspring-calc-new-button" material="default" shadow onClick={saveCurrentResult}>新建计算</Button>}
          {activeSavedRecord && view !== 'saved-list' && <Button className="offspring-calc-delete-button" material="default" style={{ '--rk-material-background': 'var(--rk-danger)', '--rk-material-color': '#fff' }} onClick={deleteCurrentCalculation}>删除结果</Button>}
        </div>
      </aside>

      <main className="offspring-calc-main">
        <div className="offspring-calc-toolbar">
          <nav className="offspring-calc-view-tabs" aria-label="子代计算器视图" role="tablist">
            <Button aria-selected={view !== 'saved-list'} className={`offspring-calc-view-tab${view !== 'saved-list' ? ' active' : ''}`} material={view !== 'saved-list' ? 'default' : 'paper'} role="tab" size="small" onClick={showCalculator}>计算器</Button>
            <Button aria-selected={view === 'saved-list'} className={`offspring-calc-view-tab${view === 'saved-list' ? ' active' : ''}`} material={view === 'saved-list' ? 'default' : 'paper'} role="tab" size="small" onClick={showSavedList}>已保存结果</Button>
          </nav>
          {view === 'saved-list' && <span className="offspring-calc-list-count">{savedRecords.length} 条记录</span>}
        </div>

        {view === 'saved-list' ? (
          <section className="offspring-calc-saved-list" aria-label="已保存的计算">
            {savedRecords.length > 0 ? (
              <div className="offspring-calc-saved-cards">
                {savedRecords.map((record) => (
                  <SavedCalculationCard key={record.id} record={record} onOpen={openSavedCalculation} onDelete={deleteSavedCalculation} onStatusChange={updateSavedStatus} />
                ))}
              </div>
            ) : (
              <Panel className="offspring-calc-saved-empty" contentClassName="offspring-calc-saved-empty-content" material="paperSoft">
                <strong>还没有保存的计算</strong>
                <span>填写亲本数值并新建计算后，记录会显示在这里。</span>
              </Panel>
            )}
          </section>
        ) : (
          <>
            <header className="offspring-calc-result-heading">
              <div className="offspring-calc-result-title-block">
                {activeSavedRecord && <StatusTags value={displayedStatus} onChange={updateActiveStatus} className="result-status-tags" />}
                {activeSavedRecord?.name && !renaming ? (
                  <div className="offspring-calc-title-row">
                    <h1>{activeSavedRecord.name}</h1>
                    <Button className="offspring-calc-title-rename-button" material="paper" variant="text" size="small" style={{ '--rk-material-background': 'var(--rk-primary-strong)', '--rk-material-color': 'var(--rk-on-paper)' }} aria-label={`重命名：${activeSavedRecord.name}`} onClick={() => { setCalculationName(activeSavedRecord.name); setRenaming(true) }}><PencilIcon />重命名</Button>
                  </div>
                ) : (
                  <div className="offspring-calc-name-editor">
                    <Input rootClassName="offspring-calc-name-input" inputClassName="offspring-calc-name-input-control" material="paperSoft" size="middle" type="text" maxLength={80} placeholder="输入计算名称" aria-label="计算名称" value={calculationName} onChange={(event) => setCalculationName(event.target.value)} />
                    {activeSavedId && <Button className="offspring-calc-name-commit-button" material="default" size="small" onClick={commitRename}>保存名称</Button>}
                    {activeSavedRecord?.name && renaming && <Button className="offspring-calc-name-cancel-button" material="paper" variant="text" size="small" onClick={() => { setCalculationName(activeSavedRecord.name); setRenaming(false) }}>取消</Button>}
                  </div>
                )}
              </div>
            </header>
            <section className="offspring-calc-summary" aria-label="当前计算摘要">
              <SummaryCard label="子代理论值（第 1 代）" value={formatPercent(firstTheoretical)} />
              <SummaryCard label="当前目标奖牌" value={medalName(target.medal)} />
              <SummaryCard label="当前固定亲本" value={target.anchor ? sideName(target.anchor) : '—'} />
            </section>
            <div className="offspring-calc-results">
              {resultNote}
              {simulation.rows.length > 0 && (
                <>
                  <Panel as="section" className="offspring-calc-table-panel" contentClassName="offspring-calc-table-panel-content" material="paperSoft">
                    <div className="offspring-calc-table-wrap">
                      <table className={`offspring-calc-table${hasSoundParents ? ' has-sound' : ''}`}>
                        <thead>
                          <tr><th>代数</th><th>子代理论值</th>{hasSoundParents && <th>子代声音值</th>}<th>子代实际体重 (%)</th><th>浮动值</th><th>判定</th></tr>
                        </thead>
                        <tbody>
                          {displayRows.map((row) => (
                            <tr className={row.generation === simulation.reachGeneration ? 'reached' : undefined} key={row.generation}>
                              <td>第 {row.generation} 代</td>
                              <td>{formatPercent(row.theoretical)}</td>
                              {hasSoundParents && <td>{formatSoundValue(soundRows[row.generation - 1])}</td>}
                              <td>
                                <Input
                                  aria-label={`第 ${row.generation} 代子代实际体重`}
                                  inputClassName="offspring-calc-row-input-control"
                                  material="paperSoft"
                                  max="100"
                                  min="0"
                                  placeholder="实测体重"
                                  rootClassName="offspring-calc-row-input"
                                  size="small"
                                  step="0.01"
                                  type="number"
                                  inputMode="decimal"
                                  value={actualValues[row.generation] ?? ''}
                                  onChange={(event) => setActualValue(row.generation, event.target.value)}
                                />
                              </td>
                              <td><FloatingValue theoretical={row.theoretical} actual={row.actual} /></td>
                              <td><MedalBadge value={row.judge} /></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Panel>
                </>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
