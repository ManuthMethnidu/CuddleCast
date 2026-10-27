import React, { useState } from 'react';
import {
  M3Button,
  M3Card,
  M3Chip,
  M3Badge,
  M3SegmentedButton,
  M3Dialog,
  M3TextField,
  M3Switch,
} from './index';
import { useAccent, ACCENT_OPTIONS } from '../../context/AccentContext';
import {
  Sparkles,
  Palette,
  Layers,
  Type,
  Activity,
  Search,
  Bell,
  Play,
  Film,
  Compass,
} from 'lucide-react';

export const M3DesignSystemShowcase: React.FC = () => {
  const { accent, setAccent } = useAccent();
  const [activeTab, setActiveTab] = useState<'overview' | 'colors' | 'typography' | 'components' | 'motion'>('overview');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [switchState, setSwitchState] = useState(true);
  const [selectedSegment, setSelectedSegment] = useState('movies');
  const [selectedChips, setSelectedChips] = useState<string[]>(['action', 'hdr']);
  const [testText, setTestText] = useState('');

  const toggleChip = (id: string) => {
    setSelectedChips((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 space-y-8">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-m3-hero bg-gradient-to-r from-[var(--md-sys-color-surface-container-high)] via-[var(--md-sys-color-surface-container)] to-[var(--md-sys-color-primary-container)]/30 border border-[var(--md-sys-color-outline-variant)] p-6 sm:p-10 shadow-m3-2">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <M3Badge color="tertiary" pulse>
                M3 EXPRESSIVE
              </M3Badge>
              <span className="font-m3-label-sm text-[var(--md-sys-color-on-surface-variant)]">
                Google Material Design 3 Spec
              </span>
            </div>
            <h1 className="font-m3-display-sm-emphasized text-[var(--md-sys-color-on-surface)] tracking-tight">
              Material 3 Expressive System
            </h1>
            <p className="font-m3-body-lg text-[var(--md-sys-color-on-surface-variant)] max-w-2xl">
              Emotion-driven UX, HCT dynamic colors, dual typography scale (30 styles),
              asymmetric morphing shapes, and physics-based spring motion schemes.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <M3Button
              variant="filled"
              icon={<Sparkles className="w-4 h-4" />}
              onClick={() => setDialogOpen(true)}
            >
              Test M3 Dialog
            </M3Button>
            <M3Button
              variant="tonal"
              icon={<Film className="w-4 h-4" />}
              onClick={() => window.open('https://m3.material.io/', '_blank')}
            >
              m3.material.io
            </M3Button>
          </div>
        </div>
      </div>

      {/* Navigation Segment Tabs */}
      <div className="flex justify-center">
        <M3SegmentedButton
          value={activeTab}
          onChange={(tab) => setActiveTab(tab as typeof activeTab)}
          options={[
            { value: 'overview', label: 'System Overview', icon: <Layers className="w-4 h-4" /> },
            { value: 'colors', label: 'HCT Colors (5 Tiers)', icon: <Palette className="w-4 h-4" /> },
            { value: 'typography', label: 'Dual Type Scale', icon: <Type className="w-4 h-4" /> },
            { value: 'components', label: 'Components', icon: <Compass className="w-4 h-4" /> },
            { value: 'motion', label: 'Spring Motion', icon: <Activity className="w-4 h-4" /> },
          ]}
        />
      </div>

      {/* Tab: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <M3Card variant="expressive" className="p-6 space-y-3">
            <div className="w-10 h-10 rounded-m3-md bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center font-bold">
              1
            </div>
            <h3 className="font-m3-title-lg-emphasized">HCT Dynamic Color</h3>
            <p className="font-m3-body-md text-[var(--md-sys-color-on-surface-variant)]">
              Perceptual color space with 5-tier surface containers (lowest to highest) and harmonic
              tertiary accents.
            </p>
          </M3Card>

          <M3Card variant="expressive" className="p-6 space-y-3">
            <div className="w-10 h-10 rounded-m3-md bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] flex items-center justify-center font-bold">
              2
            </div>
            <h3 className="font-m3-title-lg-emphasized">Dual Typography</h3>
            <p className="font-m3-body-md text-[var(--md-sys-color-on-surface-variant)]">
              15 baseline + 15 emphasized styles for Display, Headline, Title, Body, and Label.
            </p>
          </M3Card>

          <M3Card variant="expressive" className="p-6 space-y-3">
            <div className="w-10 h-10 rounded-m3-md bg-[var(--md-sys-color-tertiary-container)] text-[var(--md-sys-color-on-tertiary-container)] flex items-center justify-center font-bold">
              3
            </div>
            <h3 className="font-m3-title-lg-emphasized">Expressive Shapes</h3>
            <p className="font-m3-body-md text-[var(--md-sys-color-on-surface-variant)]">
              Asymmetric corner radii (`24px 8px 24px 8px`), pills, and shape morphs that react to
              interaction states.
            </p>
          </M3Card>

          <M3Card variant="expressive" className="p-6 space-y-3">
            <div className="w-10 h-10 rounded-m3-md bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-primary)] flex items-center justify-center font-bold">
              4
            </div>
            <h3 className="font-m3-title-lg-emphasized">Spring Motion</h3>
            <p className="font-m3-body-md text-[var(--md-sys-color-on-surface-variant)]">
              Physics-based spring curves (snappy, bouncy, smooth) with lively overshoot feedback.
            </p>
          </M3Card>
        </div>
      )}

      {/* Tab: Colors */}
      {activeTab === 'colors' && (
        <div className="space-y-6">
          <div className="bg-[var(--md-sys-color-surface-container)] rounded-m3-xl p-6 border border-[var(--md-sys-color-outline-variant)]">
            <h3 className="font-m3-title-lg-emphasized mb-2">Dynamic Accent Palette Generator</h3>
            <p className="font-m3-body-md text-[var(--md-sys-color-on-surface-variant)] mb-4">
              Select an accent to test Google Design HCT algorithm runtime generation:
            </p>
            <div className="flex flex-wrap gap-2.5">
              {ACCENT_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setAccent(opt.id)}
                  className={`
                    flex items-center gap-2 px-3.5 py-2 rounded-m3-full border transition-all duration-m3-short ease-spring-snappy
                    ${
                      accent === opt.id
                        ? 'border-[var(--md-sys-color-primary)] bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] font-bold shadow-m3-1 scale-105'
                        : 'border-[var(--md-sys-color-outline)] bg-[var(--md-sys-color-surface-container-low)] text-[var(--md-sys-color-on-surface)] hover:bg-[var(--md-sys-color-surface-container-high)]'
                    }
                  `}
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-black/20"
                    style={{ backgroundColor: opt.hex }}
                  />
                  <span className="font-m3-label-md">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 5-Tier Surface Container Swatches */}
          <div className="space-y-3">
            <h3 className="font-m3-title-lg-emphasized">M3 5-Tier Expressive Surface Hierarchy</h3>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              <div className="p-4 rounded-m3-lg bg-[var(--md-sys-color-surface-container-lowest)] border border-[var(--md-sys-color-outline-variant)] text-center">
                <span className="font-m3-label-sm block opacity-75">Lowest (Level 0)</span>
                <span className="font-m3-title-sm-emphasized">Deep Canvas</span>
              </div>
              <div className="p-4 rounded-m3-lg bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)] text-center">
                <span className="font-m3-label-sm block opacity-75">Low (Level 1)</span>
                <span className="font-m3-title-sm-emphasized">Recessed Card</span>
              </div>
              <div className="p-4 rounded-m3-lg bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] text-center">
                <span className="font-m3-label-sm block opacity-75">Container (Base)</span>
                <span className="font-m3-title-sm-emphasized">Default Surface</span>
              </div>
              <div className="p-4 rounded-m3-lg bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)] text-center">
                <span className="font-m3-label-sm block opacity-75">High (Level 3)</span>
                <span className="font-m3-title-sm-emphasized">Elevated Card</span>
              </div>
              <div className="p-4 rounded-m3-lg bg-[var(--md-sys-color-surface-container-highest)] border border-[var(--md-sys-color-outline-variant)] text-center">
                <span className="font-m3-label-sm block opacity-75">Highest (Level 4)</span>
                <span className="font-m3-title-sm-emphasized">Dialog & Modal</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Typography */}
      {activeTab === 'typography' && (
        <div className="space-y-6 bg-[var(--md-sys-color-surface-container)] p-6 rounded-m3-xl border border-[var(--md-sys-color-outline-variant)]">
          <h3 className="font-m3-title-lg-emphasized mb-2">Dual Typography Scale (Baseline vs Emphasized)</h3>
          <p className="font-m3-body-md text-[var(--md-sys-color-on-surface-variant)] mb-4">
            M3 Expressive pairs 15 baseline styles with 15 corresponding emphasized weights for editorial impact.
          </p>

          <div className="space-y-4 divide-y divide-[var(--md-sys-color-outline-variant)]">
            <div className="pt-3 grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <div>
                <span className="font-m3-label-sm text-[var(--md-sys-color-on-surface-variant)]">Display Large (Baseline - 400)</span>
                <p className="font-m3-display-lg text-[var(--md-sys-color-on-surface)] truncate">Cinema Echo</p>
              </div>
              <div>
                <span className="font-m3-label-sm text-[var(--md-sys-color-primary)]">Display Large (Emphasized - 700)</span>
                <p className="font-m3-display-lg-emphasized text-[var(--md-sys-color-primary)] truncate">Cinema Echo</p>
              </div>
            </div>

            <div className="pt-3 grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <div>
                <span className="font-m3-label-sm text-[var(--md-sys-color-on-surface-variant)]">Headline Medium (Baseline - 400)</span>
                <p className="font-m3-headline-md text-[var(--md-sys-color-on-surface)]">Trending Series & Films</p>
              </div>
              <div>
                <span className="font-m3-label-sm text-[var(--md-sys-color-primary)]">Headline Medium (Emphasized - 600)</span>
                <p className="font-m3-headline-md-emphasized text-[var(--md-sys-color-primary)]">Trending Series & Films</p>
              </div>
            </div>

            <div className="pt-3 grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <div>
                <span className="font-m3-label-sm text-[var(--md-sys-color-on-surface-variant)]">Title Large (Baseline - 400)</span>
                <p className="font-m3-title-lg text-[var(--md-sys-color-on-surface)]">Episode 12: The Journey Begins</p>
              </div>
              <div>
                <span className="font-m3-label-sm text-[var(--md-sys-color-primary)]">Title Large (Emphasized - 700)</span>
                <p className="font-m3-title-lg-emphasized text-[var(--md-sys-color-primary)]">Episode 12: The Journey Begins</p>
              </div>
            </div>

            <div className="pt-3 grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <div>
                <span className="font-m3-label-sm text-[var(--md-sys-color-on-surface-variant)]">Label Large (Baseline - 500)</span>
                <p className="font-m3-label-lg text-[var(--md-sys-color-on-surface)]">CONTINUE WATCHING</p>
              </div>
              <div>
                <span className="font-m3-label-sm text-[var(--md-sys-color-primary)]">Label Large (Emphasized - 700)</span>
                <p className="font-m3-label-lg-emphasized text-[var(--md-sys-color-primary)]">CONTINUE WATCHING</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Components */}
      {activeTab === 'components' && (
        <div className="space-y-8">
          {/* Buttons Section */}
          <M3Card variant="filled" className="p-6 space-y-4">
            <h3 className="font-m3-title-lg-emphasized">Expressive Button System</h3>
            <div className="flex flex-wrap items-center gap-4">
              <M3Button variant="filled" icon={<Play className="w-4 h-4 fill-current" />}>
                Filled Primary
              </M3Button>
              <M3Button variant="elevated">
                Elevated
              </M3Button>
              <M3Button variant="tonal">
                Filled Tonal
              </M3Button>
              <M3Button variant="outlined">
                Outlined
              </M3Button>
              <M3Button variant="text">
                Text Button
              </M3Button>
              <M3Button variant="fab" icon={<Sparkles className="w-6 h-6" />} aria-label="FAB" />
              <M3Button variant="extended-fab" icon={<Play className="w-5 h-5 fill-current" />}>
                Extended FAB
              </M3Button>
            </div>
          </M3Card>

          {/* Chips & Badges */}
          <M3Card variant="filled" className="p-6 space-y-4">
            <h3 className="font-m3-title-lg-emphasized">Chips & Badges</h3>
            <div className="flex flex-wrap items-center gap-3">
              <M3Chip
                chipType="filter"
                selected={selectedChips.includes('action')}
                onClick={() => toggleChip('action')}
              >
                Action
              </M3Chip>
              <M3Chip
                chipType="filter"
                selected={selectedChips.includes('anime')}
                onClick={() => toggleChip('anime')}
              >
                Anime
              </M3Chip>
              <M3Chip
                chipType="filter"
                selected={selectedChips.includes('hdr')}
                onClick={() => toggleChip('hdr')}
              >
                HDR10+
              </M3Chip>
              <M3Chip
                chipType="assist"
                leadingIcon={<Bell className="w-4 h-4" />}
                onClick={() => alert('Notification scheduled!')}
              >
                Remind Me
              </M3Chip>

              <div className="h-6 w-[1px] bg-[var(--md-sys-color-outline-variant)] mx-2" />

              <M3Badge color="tertiary" pulse>
                LIVE
              </M3Badge>
              <M3Badge color="primary">4K ULTRA HD</M3Badge>
              <M3Badge color="error" variant="count" count={12} />
              <M3Badge variant="dot" color="tertiary" pulse />
            </div>
          </M3Card>

          {/* Inputs & Controls */}
          <M3Card variant="filled" className="p-6 space-y-6">
            <h3 className="font-m3-title-lg-emphasized">Controls & Inputs</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <M3TextField
                label="Expressive Search"
                placeholder="Search movies, anime, streams..."
                leadingIcon={<Search className="w-4 h-4" />}
                value={testText}
                onChange={(e) => setTestText(e.target.value)}
                helperText="M3 Outlined variant with active spring focus ring"
              />

              <div className="flex flex-col justify-center space-y-4">
                <M3Switch
                  checked={switchState}
                  onChange={setSwitchState}
                  label={`Expressive Physics Switch: ${switchState ? 'Enabled' : 'Disabled'}`}
                />

                <div>
                  <span className="font-m3-label-md block mb-2 text-[var(--md-sys-color-on-surface-variant)]">
                    Segmented Category Switcher
                  </span>
                  <M3SegmentedButton
                    value={selectedSegment}
                    onChange={setSelectedSegment}
                    options={[
                      { value: 'movies', label: 'Movies' },
                      { value: 'series', label: 'TV Shows' },
                      { value: 'anime', label: 'Anime' },
                    ]}
                  />
                </div>
              </div>
            </div>
          </M3Card>
        </div>
      )}

      {/* Tab: Motion */}
      {activeTab === 'motion' && (
        <div className="space-y-6 bg-[var(--md-sys-color-surface-container)] p-6 rounded-m3-xl border border-[var(--md-sys-color-outline-variant)]">
          <h3 className="font-m3-title-lg-emphasized mb-2">Physics-Based Spring Motion Schemes</h3>
          <p className="font-m3-body-md text-[var(--md-sys-color-on-surface-variant)] mb-4">
            Instead of static bezier curves, M3 Expressive employs organic spring physics with natural bounce and tactile weight.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-m3-lg bg-[var(--md-sys-color-surface-container-high)] text-center space-y-3">
              <h4 className="font-m3-title-md-emphasized">Spring Snappy</h4>
              <p className="font-m3-body-sm text-[var(--md-sys-color-on-surface-variant)]">
                Stiffness: 350 / Damping: 25. Optimized for micro-interactions, buttons, and switches.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  className="px-4 py-2 rounded-m3-full bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] font-bold transition-transform duration-m3-short ease-spring-snappy hover:scale-110 active:scale-90"
                >
                  Hover & Press Me
                </button>
              </div>
            </div>

            <div className="p-6 rounded-m3-lg bg-[var(--md-sys-color-surface-container-high)] text-center space-y-3">
              <h4 className="font-m3-title-md-emphasized">Spring Bouncy (Expressive Overshoot)</h4>
              <p className="font-m3-body-sm text-[var(--md-sys-color-on-surface-variant)]">
                Stiffness: 220 / Damping: 15. Features lively overshoot for hero focal moments and modals.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  className="px-4 py-2 rounded-m3-full bg-[var(--md-sys-color-tertiary)] text-[var(--md-sys-color-on-tertiary)] font-bold transition-transform duration-m3-medium ease-spring-bouncy hover:scale-115 active:scale-95"
                >
                  Bouncy Overshoot
                </button>
              </div>
            </div>

            <div className="p-6 rounded-m3-lg bg-[var(--md-sys-color-surface-container-high)] text-center space-y-3">
              <h4 className="font-m3-title-md-emphasized">Spring Smooth</h4>
              <p className="font-m3-body-sm text-[var(--md-sys-color-on-surface-variant)]">
                Stiffness: 180 / Damping: 28. Fluid, natural settling for cards and navigation transitions.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  className="px-4 py-2 rounded-m3-full bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] font-bold transition-transform duration-m3-long ease-spring-smooth hover:scale-105 active:scale-98"
                >
                  Smooth Transition
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* M3 Expressive Dialog */}
      <M3Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        icon={<Sparkles className="w-8 h-8" />}
        headline="Material 3 Expressive Dialog"
        actions={
          <>
            <M3Button variant="text" onClick={() => setDialogOpen(false)}>
              Dismiss
            </M3Button>
            <M3Button variant="filled" onClick={() => setDialogOpen(false)}>
              Got It
            </M3Button>
          </>
        }
      >
        This dialog demonstrates the M3 Expressive modal specification: 28px extra-large rounded corners,
        the highest surface container tier, subtle outline borders, and physics-based spring scale entry.
      </M3Dialog>
    </div>
  );
};
