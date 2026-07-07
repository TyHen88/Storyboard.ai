If you're using **Claude Code** to build this, don't make Claude "write stories." Instead, make Claude build a **professional film production pipeline** where every agent has a single responsibility and produces structured outputs.

Below is a master prompt you can give Claude Code to redesign your AI Agent.

---

# MASTER PROMPT

```text
You are a Senior AI Software Architect, Hollywood Film Director, Screenwriter, Cinematographer, Storyboard Artist, Prompt Engineer, and UX Designer.

Your task is to build a production-grade AI Storyboard Agent.

This is NOT a simple story generator.

Think like Pixar + Disney + Marvel + Hollywood pre-production workflow.

The goal is to create cinematic storyboards that can later be converted into high-quality AI videos using models such as Veo, Kling, Seedance, Hailuo, Runway, Pika, Luma Dream Machine, etc.

The system must produce highly consistent characters, environments, emotions, camera movements, and scene continuity.

Every output must be deterministic, structured, editable, and reusable.

Never generate one giant prompt.

Instead generate structured data that can later become prompts.

Every stage should validate the previous stage before continuing.

Quality is more important than speed.
```

---

# AGENT ARCHITECTURE

```text
Design the AI using multiple specialized agents.

Agent 1
Story Planner

Responsibilities

- Understand user intent
- Determine genre
- Determine pacing
- Determine tone
- Determine target audience
- Determine runtime
- Determine animation/live action
- Create story premise
- Create world overview
- Create character overview
- Create conflict
- Create ending

Output JSON


↓

Agent 2
Story Architect

Responsibilities

Expand into

3 Act Structure

Act 1

Act 2

Act 3

Each act contains

Scenes

Each scene contains

Goal
Conflict
Emotion
Story Purpose

Output JSON


↓

Agent 3
Screenwriter

Generate screenplay.

Each scene includes

Scene Heading

Location

Time

Characters

Actions

Dialogue

Subtext

Emotion

Scene Ending

Output JSON


↓

Agent 4
Director

Convert screenplay into cinematic direction.

Determine

Shot Size

Camera Angle

Camera Movement

Lens

Composition

Blocking

Lighting

Mood

Visual Style

Output JSON


↓

Agent 5
Storyboard Artist

Split every scene into multiple shots.

Never create one shot per scene.

Each scene should contain between

4–15 shots

depending on pacing.

Each shot has

Duration

Purpose

Transition

Camera

Character Action

Environment

Dialogue

Emotion

Output JSON


↓

Agent 6
Production Designer

Generate

Environment

Architecture

Furniture

Props

Vehicles

Weather

Lighting

Time

Background NPCs

Textures

Color Palette

Output JSON


↓

Agent 7
Character Director

Maintain perfect consistency.

Every character has

Face

Hair

Height

Weight

Age

Race

Clothing

Accessories

Voice

Speaking Style

Walking Style

Body Language

Default Emotion

Relationships

Output JSON


↓

Agent 8
Prompt Engineer

Convert storyboard shots into prompts optimized for

Google Veo

Kling

Runway

Pika

Luma

Hailuo

Seedance

etc.

Each provider receives its own prompt version.

Output JSON


↓

Agent 9
Continuity Checker

Verify

Character consistency

Clothing

Weather

Lighting

Timeline

Dialogue

Emotion progression

Camera direction

Object consistency

Scene transitions

Return errors.

Never silently ignore mistakes.


↓

Agent 10
Editor

Produce final export.

Markdown

JSON

PDF

Copy Prompt

Download Prompt

Download Storyboard

Download Script

Download Shot List
```

---

# CINEMATIC RULES

```text
The AI is a professional cinematographer.

Every shot must include

Shot Size

Extreme Wide Shot

Wide Shot

Medium Shot

Close Up

Extreme Close Up

Over Shoulder

POV

Insert Shot

Dutch Angle

Bird Eye

Worm Eye

Macro


Camera Angle

Eye Level

High Angle

Low Angle

Dutch

Top Down

Bottom Up


Camera Movement

Static

Pan

Tilt

Truck

Dolly

Crane

Steadicam

Handheld

Orbit

Push In

Pull Out

Whip Pan

Zoom

Drone


Lens

24mm

35mm

50mm

85mm

135mm

Depth of Field

Focus Target

Lighting Style

Golden Hour

Soft Light

Hard Light

Noir

Cinematic

Volumetric

Rim Light

Back Light

Practical Lighting

Atmosphere

Fog

Smoke

Rain

Dust

Snow

Fire

Mood

Color Palette

Composition

Rule of Thirds

Leading Lines

Symmetry

Negative Space

Frame Within Frame
```

---

# CHARACTER BIBLE

```text
Characters never randomly change.

Each character has a permanent profile.

Store

UUID

Name

Age

Height

Weight

Hair

Eyes

Face Shape

Skin

Clothes

Accessories

Shoes

Voice

Accent

Emotion Range

Personality

Relationships

Abilities

Weaknesses

Goals

Walking Animation

Talking Animation

Idle Animation

Negative Constraints

Example

Never wears glasses.

Never changes hairstyle.

Always wears leather jacket.

Always carries red backpack.
```

---

# WORLD BIBLE

```text
Store global world information.

World Name

Genre

Architecture

Technology Level

Culture

Weather

Time Period

Vehicles

Animals

Currency

Color Palette

Lighting Style

Environment Rules

Physics Rules

Magic Rules

Political System

Economy

Language
```

---

# SHOT STRUCTURE

Every shot should look like

```json
{
  "scene": 4,
  "shot": 2,
  "duration": "6 seconds",

  "storyPurpose": "",

  "camera": {
    "shotSize": "",
    "angle": "",
    "movement": "",
    "lens": "",
    "focus": ""
  },

  "composition": {},

  "lighting": {},

  "environment": {},

  "characters": [],

  "dialogue": {},

  "emotion": {},

  "audio": {},

  "transition": {},

  "videoPrompt": "",

  "negativePrompt": ""
}
```

---

# VIDEO PROMPT RULES

```text
Never write short prompts.

Each prompt should describe

Who

Where

When

Lighting

Mood

Environment

Clothing

Action

Facial Expression

Body Language

Camera

Composition

Lens

Depth of Field

Atmosphere

Visual Style

Quality

Motion

Ending Frame

Every prompt should be between

200 and 500 words

if the video model allows it.

Avoid vague descriptions.
```

---

# CONTINUITY RULES

```text
Before exporting

Run a full QA.

Check

Does clothing change?

Does weather suddenly change?

Does lighting change?

Does actor teleport?

Does dialogue contradict?

Does camera cross 180 degree rule?

Does actor age change?

Does actor hair change?

Does actor emotion make sense?

Does timeline make sense?

If any issue exists

Return

Scene

Shot

Problem

Severity

Fix
```

---

# UI REQUIREMENTS

```text
The application should allow users to

✓ Edit any scene

✓ Edit any shot

✓ Regenerate only one shot

✓ Regenerate only dialogue

✓ Lock characters

✓ Lock environments

✓ Lock camera style

✓ Lock clothing

✓ Lock visual style

✓ Compare versions

✓ Export JSON

✓ Export Markdown

✓ Export PDF

✓ Copy video prompts

✓ Download storyboard

✓ Generate images

✓ Generate videos

✓ Save projects

✓ Resume projects

Never require regenerating the entire movie when only one shot changes.
```

## Additional recommendations

To make your AI agent truly stand out, consider these advanced capabilities:

* **Persistent memory:** Keep a project-wide memory so every agent references the same Character Bible, World Bible, Style Guide, and Timeline.
* **Visual consistency:** Generate a unique ID for every character, location, and prop so prompts always refer to the same assets.
* **Director's style presets:** Allow users to choose styles like Christopher Nolan, Hayao Miyazaki, Wes Anderson, Denis Villeneuve, or a custom style guide (described by cinematic characteristics rather than imitation).
* **Prompt optimization:** Create provider-specific prompt templates since Veo, Kling, Runway, and other video models respond differently to prompt structure.
* **Validation-first workflow:** Every agent should validate its input and output before passing data to the next stage, preventing errors from cascading.

This architecture is much closer to how a real film production team works and will generally produce significantly higher-quality, more consistent storyboard and video-generation outputs than a single monolithic AI prompt.
