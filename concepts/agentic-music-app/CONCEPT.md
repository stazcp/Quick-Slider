# Loam — a music app that grows from a vibe

> Working title. Alternatives at the end. "Loam" is the soil things grow in, which is the whole idea.

**One line:** You describe a feeling. Loam grows sound from it, listens to itself, offers you a few directions, and keeps growing. There are no notes, no tempo, no keys, no knobs. Only sound and conversation.

---

## 1. The idea

Every music tool today assumes you want to *operate* it. Loam assumes you want to *be in* it.

The person never sees a technical concept. They say things like:

- "rainy night, driving, a bit hopeful"
- "like the room is breathing"
- "too busy, let it thin out"
- "something should arrive now"
- "keep this, but older"

An agent (the **gardener**) translates that into a living sound system, listens to the result, and adjusts. When it reaches a fork, it offers two or three **cuttings** to hear. You pick one, blend them, or say nothing and let it choose. The piece is never finished and never the same twice, because it is not a file. It is a seed, a set of growth rules, and whatever the world fed into it that day.

Three promises to the person:

1. **No technicality.** Not hidden behind an "advanced" tab. Gone. The vocabulary is weather, growth, body, and feeling.
2. **It adjusts to you.** You talk to it while it plays. It responds within a breath, not a rebuild.
3. **It grows organically.** Within a session the sound evolves on its own. Across weeks your garden learns what you keep and what you prune.

---

## 2. Why organic randomness is the hard part, and the answer

The user asked for a way to get *organic* randomness into it. This is the spine of the design, so it comes first.

### The core insight: organic is not random

`Math.random()` on every parameter sounds like a broken radio. Nature does not sound like that. Nature's randomness has four properties:

| Property | What it means | What it sounds like when missing |
|---|---|---|
| **Correlated** | The next moment is close to the last one. Rain gets heavier gradually. | Jittery, nervous, mechanical. |
| **Scale-free (1/f)** | Small wobbles are frequent, big shifts are rare, and the ratio is the same at every timescale. | Either flat and static, or chaotic with no arc. |
| **Imperfect on purpose** | A human drummer is late by a few milliseconds, consistently in a way. | Quantized, dead, "MIDI". |
| **Remembering** | The system's history shapes its future. A forest regrows differently after a fire. | Resets. Loops. Nothing is earned. |

White noise is random. Pink noise is rain. Loam is built on pink.

### The seven layers of the Weather engine

Each layer adds randomness at a different timescale, and each has a reason to exist. Together they are called **Weather** internally, because that is the user-facing metaphor too: "today's garden was shaped by the rain in Limassol and the hum of your room."

**Layer 1. World seeds (hours to days).**
The slowest and most meaningful entropy comes from real, slowly changing natural processes, pulled once per session and gently throughout:

- Local weather at the listener's location (pressure, humidity, wind, cloud cover). Open-Meteo is free and keyless.
- Time of day and season, as continuous values (sun angle, not "night mode").
- Space weather (solar wind speed, Kp index) from NOAA. Essentially cosmic pink noise, free.
- Tide height from the nearest coast.
- Recent seismic activity (USGS feed): rare, big, and a good source of "events".
- The device itself: accelerometer micro-motion while held, ambient light, battery temperature.
- **Room ambience.** With permission, a few seconds of microphone input, analyzed for level and spectral shape, never recorded or stored. The room becomes part of the soil. Optionally, a heavily processed grain of it becomes a texture species in the piece.

These are not just numbers for a seed. They map onto musical axes: pressure to weight, humidity to reverb density, wind to motion, light to brightness. Two listeners sharing the same seed on different days hear siblings, not clones.

**Layer 2. 1/f drift (seconds to minutes).**
Every continuous parameter in the engine (filter openness, stereo width, layer gain, grain density, detune) is modulated by its own pink noise source, generated with the Voss-McCartney algorithm, cheap enough to run hundreds of instances. This is what makes a held pad feel like it is alive rather than frozen. Nothing in Loam is ever a flat line.

```ts
// Voss-McCartney pink noise: sum of N white noise sources,
// each updated at half the rate of the previous one.
class Pink {
  private rows: number[]; private counter = 0;
  constructor(private n = 12, private rng: () => number) {
    this.rows = Array.from({ length: n }, () => rng() * 2 - 1);
  }
  next(): number {
    this.counter = (this.counter + 1) >>> 0;
    const bit = Math.min(this.n - 1, ctz(this.counter)); // lowest set bit
    this.rows[bit] = this.rng() * 2 - 1;
    return this.rows.reduce((a, b) => a + b, 0) / this.n;
  }
}
```

**Layer 3. Deterministic chaos (beats to bars).**
Modulators that need to be lively but *replayable* come from chaotic systems: a Lorenz attractor for slow three-dimensional wandering, a logistic map near the edge of chaos for rhythmic decisions. They never repeat, but given the same seed they replay exactly. This is what makes "pressing" a moment (section 6) possible.

**Layer 4. Growth grammars (phrases).**
Melodic and rhythmic material is not written as notes. It is grown from **L-systems**: an axiom and a few production rules, applied generation after generation. Rules are probabilistic, so each regrowth is a cousin of the last. The gardener agent chooses and mutates rules, never individual notes.

```
axiom:  A
rules:  A -> A B        (0.6)     a gesture, then an answer
        A -> A . A      (0.3)     a gesture, a breath, the gesture again
        A -> B          (0.1)     the answer alone
        B -> b b .      (0.7)     two small steps, then rest
        B -> B B        (0.3)     the answer insists
```

Symbols map to *contours and durations*, not pitches. Pitch is resolved at render time against the garden's **tuning** (a pitch set chosen for the vibe, see 2.3), so growth stays musical however wild it gets.

**Layer 5. Ecology (sections and arcs).**
Each sound layer is an **organism** with hunger, lifespan, and offspring. A pad "eats" space; a pulse "eats" attention. Population dynamics (a simple predator-prey model) regulate density: when the mix gets crowded, voices starve and die back; when it empties, something sprouts. Tension and release emerge rather than being scheduled. Organisms that reproduce pass on mutated grammar rules. This is the layer that makes a twenty-minute session have shape without anyone writing a timeline.

**Layer 6. The gardener's taste (the surprise).**
A language model is itself a source of randomness with judgment. Every "breath" (section 4), the gardener may spend from a small **imperfection budget**: a late entrance, a wrong-but-right sample, a layer that drops out for no reason and comes back changed. Jazz players call these choices. The model picks *where* surprise lands, so it feels intentional. A user-facing dial called **wildness** scales both the budget and the model's sampling temperature.

**Layer 7. Memory (days to months).**
Every keep and prune feeds a small per-person taste model (section 7). The garden's soil changes. Randomness in Loam is never memoryless: the distribution the engine draws from is the sediment of everything you have kept.

### Keeping randomness musical

Freedom without constraints is mush. Three guardrails:

- **Tuning.** Each garden has a pitch set (five to seven pitches, chosen by the gardener for the vibe, drawn from world scales, not just Western modes). All grown material snaps to it. Users never see it.
- **Elastic grid.** Time is organized but humanized: every event's onset is offset by a pink-noise value scaled by a per-organism "looseness". Tight organisms stay tight; loose ones breathe.
- **The critic loop.** The engine continuously reports features (loudness, spectral centroid, event density, novelty) and the gardener compares them against the intent. Drift beyond a tolerance gets a nudge. Randomness proposes; the critic disposes.

---

## 3. The experience

### First minute

1. Open the app. A slowly moving organic visual, already quietly sounding something tied to the time of day and local weather. No empty state.
2. A single prompt: **"What does it feel like?"** Type, speak, or drop a photo.
3. Within a few seconds the sound bends toward what you said. A short caption appears: *"Starting with something low and wet. Letting it find its shape."*
4. You listen. You talk. "Warmer." "Less." "Something far away." Each adjustment lands within a breath.

### Cuttings

Every few minutes, or when you say "hmm" or "I don't know", the gardener offers **three cuttings**: short previews of where the piece could go next, each named in plain language:

> - *the one that opens up*
> - *the one that goes underground*
> - *the one that waits*

Tap one to hear it crossfade in. Tap two to blend. Ignore them and the gardener picks based on your taste. There are never labels like "variation B, +3dB, more reverb".

### Talking to it

The grammar of conversation covers everything:

| You say | It hears |
|---|---|
| "more rain" | increase texture density, humidity, high-frequency grain |
| "let it breathe" | lower event density, widen space, lengthen rests |
| "something should happen" | spend imperfection budget, spawn a new organism |
| "I liked the thing a minute ago" | rewind the ecology state, re-seed from that moment |
| "keep this" | **press** this moment (section 6) |
| "this but older" | lower brightness, add wear (noise floor, wobble, bandwidth limits) |
| "I'm not sure" | offer cuttings |
| *(nothing, for a while)* | keep growing, slowly, within tolerance |

### Gestures (optional, minimal)

A long press is a held breath: the piece thins while you hold. A pinch is density. A slow drag is direction. All three are mapped to intent axes, not parameters. The app works fully by voice and text alone; gestures are seasoning.

---

## 4. The gardener: agent architecture

The agent is not in the audio path. It would be far too slow. Instead, the architecture separates what the agent does well (meaning, taste, surprise) from what a real-time engine does well (continuity, timing).

```
 you ──speech/text/photo──▶ ┌─────────────┐
 world feeds ─────────────▶ │  Gardener   │  (Claude, tool use)
 room / device sensors ───▶ │  agent      │
                            └──┬──────┬───┘
            intent vector,     │      ▲  listen report
            palette, grammar,  │      │  (features, drift
            nudges, cuttings   ▼      │   from intent)
                        ┌──────────────────┐
                        │  Growth engine   │  real-time, in-browser
                        │  weather · 1/f · │  (Web Audio / WASM)
                        │  chaos · L-sys · │
                        │  ecology · critic│
                        └────────┬─────────┘
                                 ▼
                               sound
```

### The breath cycle

The engine runs on its own. The gardener wakes up on a **breath**: every 8 to 16 bars, or immediately on user input. Each breath it receives a compact **listen report** and returns a small set of tool calls. This keeps latency where it belongs: user intent lands within one breath (a couple of seconds), while the sound itself never stalls.

### The intent vector

Internal only. Roughly twelve continuous axes the gardener writes and the engine reads:

`energy · weight · warmth · brightness · density · space · motion · tension · grain · wear · intimacy · wildness`

Plus a short **narrative**: "starts sparse, something arrives around the second minute, ends by thinning to one voice." The engine interprets the narrative as a slow target trajectory for the ecology.

### Tools the gardener can call

Each has a strict schema so the engine never receives nonsense.

| Tool | What it does |
|---|---|
| `set_intent` | Move the intent vector, with a glide time. |
| `choose_tuning` | Pick a pitch set for the garden. |
| `spawn_species` | Add an organism: timbre family, grammar rules, looseness, lifespan. |
| `mutate_species` | Change one organism's rules or voice. |
| `prune` | Retire an organism gracefully. |
| `set_narrative` | Replace the long-arc trajectory. |
| `spend_surprise` | Place one imperfection: late entry, dropout, wrong sample, pitch bend. |
| `fork_cuttings` | Ask the engine to pre-render N short branches with given mutations; returns handles. |
| `press` | Freeze this moment as a recording plus its full seed state. |
| `recall_taste` | Read the person's taste summary. |
| `listen` | Fetch the latest feature report on demand. |

### Model choice and prompting

- Use **Claude Opus 5.5** (`claude-opus-5-5`) for the gardener. Thinking is always on; run the breath loop at effort `low` for speed and the opening composition and cutting generation at `high`. Set effort explicitly, since the default on this model is `medium`.
- Pass the taste summary, the vocabulary guide, and the tool definitions in a stable system prompt with prompt caching, and put the volatile listen report last.
- Use `strict: true` on every tool so arguments always validate against the engine's schema.
- Forced tool choice is not available on this model. Steer the gardener from the prompt and validate every tool input before applying it.
- Enable server-side refusal fallbacks by default so a declined request degrades rather than silences the garden.
- The system prompt teaches the gardener the **vocabulary** (section 8) so every caption and cutting name stays non-technical. Captions are a single short sentence, present tense, no adjectives from audio engineering.

Speech in: browser speech recognition for v0, a hosted model later. Speech out: none at first. The gardener speaks in captions and in sound.

---

## 5. The growth engine: sound without notes

### Species, not instruments

A **species** is a timbre family plus a behavior: how it enters, how it moves, what it eats, how long it lives. Starting families, each with several voices:

- **Ground**: sub tones, slow pads, drones. Eats space.
- **Weather**: noise textures, rain, wind, grain clouds. Eats brightness.
- **Pulse**: soft percussive events, heartbeat-like. Eats attention.
- **Voice**: melodic fragments grown from grammars. Eats tension.
- **Found**: processed room ambience and tiny field recordings. Eats intimacy.
- **Echo**: delayed, degraded copies of other species. Eats memory.

### Three engine options, and the recommendation

| Option | Pros | Cons |
|---|---|---|
| **A. Procedural synthesis** in Web Audio (Tone.js, or Faust/RNBO compiled to WASM) | Infinite variation, zero latency, continuous, no licensing, cheap to run, runs offline | Timbres can sound thin without serious design work |
| **B. Neural audio generation** (Stable Audio Open, MusicGen, or successors) | Rich, convincing timbres | Seconds of latency, chunk seams, hard to steer continuously, fights the "grows live" promise, cost per minute |
| **C. Hybrid** | Neural models generate a **palette** of species voices once per garden (short loops, one-shots, textures); the procedural engine grows, places, mutates, and spatializes them live | Two systems to maintain |

**Recommendation: start with A, design for C.** The organic layers in section 2 all live in the procedural engine regardless. Neural palettes are an upgrade to timbre, not to the idea. A good procedural engine with pink drift and an ecology already sounds alive; a neural track rendered in thirty-second chunks does not.

### Spatial sound

Every organism has a position in a soft stereo field that drifts with its own pink source. Headphone users get subtle binaural movement. "Something far away" is literal: lower, filtered, more reverb, placed at the edge.

---

## 6. Pressing, seeds, and sharing

A piece in Loam is never a file. It is:

```
garden = seed + grammar rules + species list + taste snapshot + world-input log
```

Three ways to hold onto something:

- **Press.** Like pressing a flower. Freezes a moment as a recording (a real audio file you can export) together with the complete state that produced it, so it can be regrown exactly or used as a starting point.
- **Share a seed.** Send a garden without its world-input log. The recipient hears a sibling shaped by their own weather, their own room. The seed carries intent; the day supplies the rest.
- **Share a pressing.** Send the exact moment. Identical for everyone.

Gardens you return to have **drifted** since you left, by a controlled amount tied to real elapsed time. A garden you have not opened in a month has changed with the season. You can always say "take me back to how it was."

---

## 7. Growing across time: the soil

The taste model is deliberately small and local:

- Every keep, prune, cutting choice, pressing, and "more of that" is logged as an intent vector plus the species involved.
- A running summary (a few hundred words, written by the gardener itself at the end of each session) becomes the **soil**: "They like low, slow ground with a single bright voice that arrives late. They prune anything that pulses too regularly. Evenings skew heavier."
- The soil is shown to the person in plain language and is editable. "No, I love pulses, I was just tired that night."

Longer-term growth ideas, in order of ambition:

1. **Cross-pollination.** Species that thrived in one of your gardens can migrate into another.
2. **Seasons.** The soil has a slow cycle; the gardener occasionally proposes something against your taste, labelled honestly: *"the one you probably won't like."*
3. **Commons.** Opt-in: species can migrate between people's gardens. Your rain might end up in someone else's night drive.

---

## 8. Vocabulary: the words the app is allowed to use

The gardener, the UI, and the captions share one small dictionary. If a word is not here, it needs a reason.

| Use | Never |
|---|---|
| garden, grow, sprout, prune, press, cutting, soil, weather, breath | track, song, loop, stem, project, preset, parameter |
| warmer, colder, brighter, darker, heavier, lighter | EQ, filter, cutoff, low-pass |
| busier, thinner, closer, farther, wider, tighter | density, gain, pan, reverb, compression |
| faster, slower, steadier, looser | BPM, tempo, quantize, swing |
| wilder, calmer, stranger, plainer | temperature, randomness, entropy, seed |
| older, newer, worn, clean | bitrate, saturation, noise floor |
| arrive, leave, return, insist, wait, answer | intro, verse, drop, bridge, section |

---

## 9. Build sketch

Suggested stack, matching the person's existing tools (React, Vercel, Supabase):

| Layer | Choice | Why |
|---|---|---|
| App | TypeScript, Vite + React, Zustand | Fast iteration, the person's home turf |
| Sound | Tone.js on Web Audio for v0; Faust or RNBO to WASM for richer voices later | Runs in the browser, nothing to install |
| Analysis | Meyda (features in the browser) for the listen report | Light, real-time |
| Agent | `@anthropic-ai/sdk` on a small server route (Next.js API route, Hono, or a Supabase Edge Function) | Keeps the key off the client; streams tool calls back |
| World feeds | Open-Meteo, NOAA SWPC, USGS, NOAA tides, all free | Fetched server-side, cached per hour |
| Persistence | Supabase (gardens, pressings, soil); local-first with sync | Already connected |
| Hosting | Vercel | Already connected |
| Mobile | Later: Expo with a native audio engine, or a PWA first | Audio on mobile browsers has interruptions; validate the idea on desktop first |

Repo shape for the new project:

```
loam/
  apps/web/            React app: visual, conversation, cuttings
  packages/engine/     growth engine: weather, pink, chaos, lsystem, ecology, critic, species
  packages/gardener/   agent loop, tools, prompts, vocabulary, taste summary
  packages/feeds/      world-input adapters with caching and offline fallbacks
  packages/schema/     shared types: intent vector, species, garden, pressing
  docs/                this document, and the vocabulary as a living file
```

---

## 10. Roadmap

### v0 "Seedling" (prove the feeling)

- Text vibe in, sound out within five seconds.
- Procedural engine with three species (ground, weather, voice), pink drift on every parameter, one L-system grammar, a tuning chosen per garden.
- World seed from local weather and time of day only.
- Conversation adjusts intent. No cuttings yet.
- One garden at a time. No accounts.
- Success test: ten people say "describe a vibe", listen for three minutes, and at least half say "it got it" without being told what any control does, because there are none.

### v1 "Sprout" (prove the agency)

- Full breath cycle with listen reports and the critic loop.
- Cuttings: three pre-rendered branches with plain-language names.
- Pressing and export.
- Ecology layer replaces fixed arrangement.
- Room ambience as a seed and as a found species.
- Soil: per-person taste summary, visible and editable.

### v2 "Garden" (prove the growth)

- Multiple gardens that drift with real time.
- Seed sharing (siblings) and pressing sharing (identical).
- Neural palette generation for richer species voices.
- Mobile.
- Optional commons: species migration between people.

---

## 11. Risks, honestly

- **It sounds like a nice screensaver.** The biggest risk. Mitigation: the ecology and the imperfection budget exist specifically to create *events*. Test for "something happened" moments per ten minutes, not for prettiness.
- **Latency breaks the conversation.** Mitigation: the agent never touches audio directly; intent glides; the engine responds to the first tool call before the agent has finished its turn.
- **Randomness reads as noise.** Mitigation: tuning, elastic grid, critic loop, and 1/f everywhere. If it still reads as noise, lower wildness defaults, not the architecture.
- **Procedural timbres sound cheap.** Real risk for v0. Mitigation: invest in six great voices rather than sixty mediocre ones; plan the hybrid path.
- **Cuttings cause choice fatigue.** Mitigation: never more than three, never forced, the gardener picks if you ignore them, and the frequency adapts to how often you engage.
- **Mobile browser audio.** Interruptions, autoplay policies, background limits. Mitigation: desktop and headphones first; native later.
- **Model cost per minute of listening.** A breath every 16 bars at low effort with cached prompts is cheap. Measure it in v0 and set a hard per-session budget.

---

## 12. Open questions

- Should the visual be generative and tied to the audio (likely yes, same pink sources), or should the screen be nearly empty to keep attention on sound?
- How much should the gardener *say*? One caption per breath may be too chatty. Possibly captions only when something changes by intent.
- Is a tuning per garden too conservative? An alternative is a slowly drifting tuning, driven by the ecology.
- Where does the microphone line sit for privacy? Current stance: analyze locally, never store, never send audio to the server. The gardener only ever sees numbers.
- Photo input: map image features (color temperature, contrast, texture) to intent axes directly, or describe the image in words first and let the gardener interpret? Try both in v0.

---

## 13. Names

Working title **Loam**. Others that fit the garden-and-weather metaphor:

Undergrowth · Petrichor · Mycelium · Moss · Hum · Drift · Verdant · Sediment · Lichen · Fernery

Pick after v0, once the sound tells you what it is.
