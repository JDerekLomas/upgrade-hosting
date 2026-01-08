# Decision Point Patterns for Educational Applications

This document provides patterns for implementing A/B tests in educational contexts, with considerations for learning science, classroom dynamics, and practical implementation.

## What is a Decision Point?

A decision point is a location in your code where the user experience can vary based on experiment assignment. In UpGrade terminology:

- **Site**: The feature or location being tested (e.g., `problem_feedback`)
- **Target**: Optional sub-location within the site (e.g., `algebra_unit`)
- **Condition**: The variant assigned (e.g., `immediate`, `delayed`, `control`)
- **Payload**: Condition-specific configuration data

## Pattern Categories

### 1. UI/UX Variants

Testing different interface designs while keeping content identical.

#### Example: Problem Interface Layout

```typescript
// Decision point: How to display math problems
const { condition, payload } = await upgrade.getAssignment('problem_layout');

switch (condition) {
  case 'vertical':
    // Problem above, answer input below
    return <VerticalProblemLayout problem={problem} />;

  case 'horizontal':
    // Problem and answer side-by-side
    return <HorizontalProblemLayout problem={problem} />;

  case 'interactive':
    // Drag-and-drop or manipulative-based
    return <InteractiveProblemLayout problem={problem} />;

  default:
    return <VerticalProblemLayout problem={problem} />;
}
```

**Assignment Unit**: Individual (each student can have different UI)
**Metrics to Log**:
- `problem_completion_time_ms`
- `errors_before_correct`
- `hint_requests`

#### Example: Navigation Structure

```typescript
const { condition } = await upgrade.getAssignment('nav_structure');

// Control: Traditional linear progression
// Treatment: Concept map with flexible navigation
const Navigation = condition === 'concept_map'
  ? ConceptMapNav
  : LinearNav;
```

**Assignment Unit**: Classroom (avoid confusion when students collaborate)

---

### 2. Pedagogical Approaches

Testing different teaching strategies or learning sequences.

#### Example: Worked Examples vs Practice

```typescript
// Research question: Do worked examples improve learning vs immediate practice?
const { condition } = await upgrade.getAssignment('learning_approach', 'fractions_unit');

if (condition === 'worked_examples_first') {
  // Show 3 worked examples, then practice
  return (
    <>
      <WorkedExampleSequence count={3} topic="fractions" />
      <PracticeProblems topic="fractions" />
    </>
  );
} else if (condition === 'interleaved') {
  // Alternate worked examples and practice
  return <InterleavedLearning topic="fractions" />;
} else {
  // Control: Practice problems only
  return <PracticeProblems topic="fractions" />;
}
```

**Assignment Unit**: Classroom (teachers need consistent instructional approach)
**Metrics to Log**:
- `pretest_score` (before unit)
- `posttest_score` (after unit)
- `delayed_test_score` (2 weeks later)
- `time_on_task_minutes`

#### Example: Concrete → Abstract Sequencing

```typescript
// Research: Should visual manipulatives precede symbolic notation?
const { condition } = await upgrade.getAssignment('abstraction_sequence');

const sequence = condition === 'concrete_first'
  ? ['manipulative', 'pictorial', 'symbolic']  // CPA approach
  : ['symbolic', 'pictorial', 'manipulative']; // Traditional

return <LearningSequence stages={sequence} topic={currentTopic} />;
```

**Assignment Unit**: School (curriculum-level decision)

---

### 3. Feedback Timing & Type

Testing when and how to provide feedback on student responses.

#### Example: Immediate vs Delayed Feedback

```typescript
const { condition, payload } = await upgrade.getAssignment('feedback_timing');

async function handleAnswer(answer, isCorrect) {
  upgrade.log('answer_submitted', 1);
  upgrade.log('answer_correct', isCorrect);

  if (condition === 'immediate') {
    // Show feedback right away
    showFeedback(isCorrect);

  } else if (condition === 'delayed') {
    // Delay feedback by configured amount
    const delayMs = payload?.delayMs || 5000;
    await sleep(delayMs);
    showFeedback(isCorrect);

  } else if (condition === 'end_of_set') {
    // Batch feedback at end of problem set
    queueFeedback(problemIndex, isCorrect);
    if (isLastProblem) {
      showBatchFeedback();
    }
  }
}
```

**Assignment Unit**: Individual (feedback is personal)
**Metrics to Log**:
- `retry_after_feedback` (boolean)
- `time_to_next_problem_ms`
- `subsequent_problem_correct`

#### Example: Feedback Specificity

```typescript
const { condition } = await upgrade.getAssignment('feedback_detail');

function generateFeedback(answer, correctAnswer, isCorrect) {
  if (isCorrect) {
    return { type: 'correct', message: 'Correct!' };
  }

  switch (condition) {
    case 'minimal':
      // Just right/wrong
      return { type: 'incorrect', message: 'Try again.' };

    case 'correct_answer':
      // Show the right answer
      return {
        type: 'incorrect',
        message: `The correct answer is ${correctAnswer}.`
      };

    case 'elaborated':
      // Explain why and how
      return {
        type: 'incorrect',
        message: generateElaboratedFeedback(answer, correctAnswer)
      };

    case 'socratic':
      // Ask guiding question
      return {
        type: 'incorrect',
        message: generateGuidingQuestion(answer, correctAnswer)
      };
  }
}
```

**Assignment Unit**: Classroom (teachers may reference feedback style)

---

### 4. Adaptive Algorithm Parameters

Testing different parameters in adaptive learning systems.

#### Example: Mastery Threshold

```typescript
// Research: What mastery threshold optimizes long-term retention?
const { condition, payload } = await upgrade.getAssignment('mastery_threshold');

const threshold = payload?.threshold || 0.8; // Default 80%

function checkMastery(skillId, performanceHistory) {
  const recentAccuracy = calculateRecentAccuracy(performanceHistory);

  if (recentAccuracy >= threshold) {
    // Move to next skill
    upgrade.log('skill_mastered', 1);
    upgrade.log('problems_to_mastery', performanceHistory.length);
    return { mastered: true, nextSkill: getNextSkill(skillId) };
  }

  return { mastered: false, continueSkill: skillId };
}
```

**Conditions**:
- `low_threshold`: 70% accuracy
- `standard_threshold`: 80% accuracy
- `high_threshold`: 90% accuracy

**Assignment Unit**: Individual
**Metrics to Log**:
- `problems_to_mastery`
- `skill_retention_7_day` (requires delayed assessment)
- `total_time_in_unit`

#### Example: Spaced Repetition Intervals

```typescript
const { condition } = await upgrade.getAssignment('spacing_algorithm');

function calculateNextReview(skill, performanceHistory) {
  const lastReview = getLastReviewDate(skill);
  const interval = performanceHistory.consecutiveCorrect;

  let multiplier;
  switch (condition) {
    case 'aggressive':
      multiplier = 2.5; // Longer gaps
      break;
    case 'conservative':
      multiplier = 1.5; // Shorter gaps
      break;
    case 'adaptive':
      multiplier = calculateAdaptiveMultiplier(performanceHistory);
      break;
    default:
      multiplier = 2.0;
  }

  const daysUntilReview = Math.pow(multiplier, interval);
  return addDays(lastReview, daysUntilReview);
}
```

**Assignment Unit**: Individual

---

### 5. Content Presentation

Testing how educational content is displayed.

#### Example: Video vs Text Instruction

```typescript
const { condition } = await upgrade.getAssignment('instruction_format', currentTopic);

function renderInstruction(topic) {
  const content = getInstructionalContent(topic);

  switch (condition) {
    case 'video':
      return <VideoPlayer src={content.videoUrl} />;

    case 'text':
      return <TextInstruction content={content.text} />;

    case 'interactive':
      return <InteractiveWalkthrough steps={content.steps} />;

    case 'choice':
      // Let student choose (meta-experiment!)
      return <FormatChooser content={content} onChoice={logChoice} />;
  }
}
```

**Assignment Unit**: Individual (learning preferences vary)
**Metrics to Log**:
- `instruction_time_ms`
- `instruction_completed` (boolean)
- `instruction_replayed` (for video)
- `post_instruction_quiz_score`

#### Example: Problem Context

```typescript
// Research: Do contextualized problems improve transfer?
const { condition } = await upgrade.getAssignment('problem_context');

function generateProblem(skill, difficulty) {
  const baseProblem = getProblemTemplate(skill, difficulty);

  switch (condition) {
    case 'abstract':
      // "Solve: 3x + 5 = 20"
      return renderAbstract(baseProblem);

    case 'story':
      // "Maria has 3 bags of apples..."
      return renderStoryContext(baseProblem, getRandomContext());

    case 'relevant':
      // Context matched to student interests/demographics
      return renderStoryContext(baseProblem, getStudentRelevantContext());

    case 'game':
      // Embedded in game narrative
      return renderGameContext(baseProblem, currentGameState);
  }
}
```

**Assignment Unit**: Classroom (avoid "why is my problem different" confusion)

---

### 6. Gamification Elements

Testing motivational game mechanics.

#### Example: Points & Rewards

```typescript
const { condition, payload } = await upgrade.getAssignment('reward_system');

function onCorrectAnswer() {
  if (condition === 'no_rewards') {
    // Control: No gamification
    showSimpleFeedback('Correct!');
    return;
  }

  if (condition === 'points') {
    const points = payload?.pointsPerCorrect || 10;
    addPoints(points);
    showPointsAnimation(points);
  }

  if (condition === 'streaks') {
    incrementStreak();
    if (currentStreak % 5 === 0) {
      showStreakCelebration(currentStreak);
    }
  }

  if (condition === 'badges') {
    checkAndAwardBadges();
  }
}
```

**Assignment Unit**: Classroom (social comparison is powerful)
**Metrics to Log**:
- `session_duration_minutes`
- `voluntary_practice_problems` (beyond required)
- `days_active_per_week`
- `problems_completed_total`

#### Example: Leaderboards

```typescript
const { condition } = await upgrade.getAssignment('social_comparison');

function renderSidebar() {
  switch (condition) {
    case 'no_leaderboard':
      return <ProgressTracker personal={true} />;

    case 'class_leaderboard':
      // Show ranking within class
      return <Leaderboard scope="class" showRank={true} />;

    case 'anonymous_comparison':
      // Show percentile without names
      return <PercentileIndicator />;

    case 'collaborative':
      // Class working toward shared goal
      return <ClassGoalProgress />;
  }
}
```

**Assignment Unit**: Classroom (leaderboard only makes sense within group)
**Caution**: Leaderboards can demotivate struggling students

---

### 7. Hint Systems

Testing help-seeking and scaffolding strategies.

#### Example: Hint Availability

```typescript
const { condition, payload } = await upgrade.getAssignment('hint_system');

function HintButton({ problem }) {
  const [hintsUsed, setHintsUsed] = useState(0);
  const maxHints = payload?.maxHints || 3;

  if (condition === 'no_hints') {
    return null; // No hints available
  }

  if (condition === 'unlimited_hints') {
    return <UnlimitedHintButton problem={problem} />;
  }

  if (condition === 'limited_hints') {
    return (
      <LimitedHintButton
        problem={problem}
        remaining={maxHints - hintsUsed}
        onUse={() => {
          setHintsUsed(h => h + 1);
          upgrade.log('hint_used', hintsUsed + 1);
        }}
      />
    );
  }

  if (condition === 'earned_hints') {
    // Must complete problems to earn hints
    return <EarnedHintButton earnedHints={studentHintBalance} />;
  }
}
```

**Assignment Unit**: Individual
**Metrics to Log**:
- `hints_requested`
- `hints_to_correct`
- `correct_without_hints`
- `hint_dependency_ratio` (hints / problems)

---

### 8. Assessment Variants

Testing different quiz/test formats.

#### Example: Question Format

```typescript
const { condition } = await upgrade.getAssignment('question_format', skill);

function renderQuestion(question) {
  switch (condition) {
    case 'multiple_choice':
      return <MultipleChoice question={question} options={4} />;

    case 'free_response':
      return <FreeResponseInput question={question} />;

    case 'worked_solution':
      // Student must show work
      return <StepByStepInput question={question} />;

    case 'self_explanation':
      // Student explains their reasoning
      return <ExplanationPrompt question={question} />;
  }
}
```

**Assignment Unit**: Varies (may need classroom for fair grading)

---

## Implementation Checklist

Before implementing a decision point:

### 1. Define the Research Question
- [ ] What learning outcome are you trying to improve?
- [ ] What's your hypothesis?
- [ ] How will you measure success?

### 2. Choose Assignment Unit
- [ ] Individual: Personal experience, no social effects
- [ ] Classroom: Teacher needs consistency, peer collaboration
- [ ] School: Curriculum-level decisions, administrative buy-in

### 3. Identify Metrics
- [ ] Primary outcome (what you're optimizing for)
- [ ] Secondary outcomes (unintended effects)
- [ ] Process metrics (engagement, time on task)
- [ ] Delayed outcomes (retention, transfer)

### 4. Consider Confounds
- [ ] Can students see each other's conditions?
- [ ] Will teachers treat conditions differently?
- [ ] Are there device/browser differences?
- [ ] Time-of-day effects?

### 5. Plan for Edge Cases
- [ ] What if assignment fails? (fallback condition)
- [ ] What if student changes groups mid-experiment?
- [ ] What if teacher wants to switch conditions?

### 6. Ethical Considerations
- [ ] Could any condition harm learning?
- [ ] Is there informed consent (IRB if research)?
- [ ] Can students opt out?
- [ ] Will results be shared with teachers/parents?

---

## Metrics Reference

### Common Learning Metrics

| Metric | Type | Description |
|--------|------|-------------|
| `pretest_score` | number | Assessment before intervention |
| `posttest_score` | number | Assessment after intervention |
| `delayed_test_score` | number | Assessment after delay (retention) |
| `problems_attempted` | number | Total problems tried |
| `problems_correct` | number | Total correct answers |
| `problems_to_mastery` | number | Problems needed to reach mastery |
| `time_on_task_minutes` | number | Active learning time |
| `session_count` | number | Number of learning sessions |
| `hints_used` | number | Help requests |
| `errors_before_correct` | number | Attempts per problem |

### Engagement Metrics

| Metric | Type | Description |
|--------|------|-------------|
| `session_duration_ms` | number | Time per session |
| `voluntary_problems` | number | Extra practice beyond required |
| `days_active` | number | Days with activity |
| `dropout` | boolean | Did student abandon? |
| `return_rate` | number | Sessions per week |

### Process Metrics

| Metric | Type | Description |
|--------|------|-------------|
| `time_to_first_action_ms` | number | Latency before starting |
| `problem_time_ms` | number | Time per problem |
| `video_watch_percent` | number | Portion of video watched |
| `scroll_depth` | number | How far user scrolled |
| `backtrack_count` | number | Times user went back |
