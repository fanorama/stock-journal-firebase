# Journal Entries Specification

> **Note:** All journal entries are scoped within a portfolio context. Journals are stored in Firestore at `users/{userId}/portfolios/{portfolioId}/journals/{journalId}`.

## ADDED Requirements

### Requirement: Create Journal Entry

The system SHALL allow users to create journal entries for trades containing notes about strategy, emotions, and lessons learned.

#### Scenario: Create entry for a trade
- **WHEN** user creates a journal entry for a BBCA trade with notes about entry strategy and market condition
- **THEN** the system saves the entry and associates it with the trade

#### Scenario: Create entry with all fields
- **WHEN** user creates an entry with entry reason, exit strategy, emotions, and lessons learned
- **THEN** the system saves all fields and displays them in the journal view

#### Scenario: Create entry without trade association
- **WHEN** user creates a general journal entry not linked to specific trade
- **THEN** the system saves the entry as standalone journal note

### Requirement: Edit Journal Entry

The system SHALL allow users to edit existing journal entries to add reflections or update notes.

#### Scenario: Update entry notes
- **WHEN** user edits a journal entry to add post-trade reflections
- **THEN** the system updates the entry with timestamp of last modification

#### Scenario: Update multiple fields
- **WHEN** user updates entry reason, emotions, and lessons learned
- **THEN** the system saves all updated fields

### Requirement: Delete Journal Entry

The system SHALL allow users to delete journal entries with confirmation.

#### Scenario: Delete entry successfully
- **WHEN** user confirms deletion of a journal entry
- **THEN** the system removes the entry (trade remains unaffected)

#### Scenario: Cancel deletion
- **WHEN** user cancels the deletion confirmation
- **THEN** the system keeps the entry unchanged

### Requirement: View Journal Entries

The system SHALL display journal entries with filtering by date, trade, or content search.

#### Scenario: View all entries chronologically
- **WHEN** user opens the journal page
- **THEN** the system displays all entries sorted by creation date (newest first)

#### Scenario: Filter entries by trade
- **WHEN** user filters entries by specific stock symbol
- **THEN** the system displays only entries associated with that stock

#### Scenario: Search entry content
- **WHEN** user searches for keyword "breakout" in entries
- **THEN** the system displays entries containing that keyword in any field

### Requirement: Link Entry to Trade

The system SHALL automatically link journal entries to trades and allow viewing trade details from journal view.

#### Scenario: View trade from journal entry
- **WHEN** user clicks on a linked trade from journal entry
- **THEN** the system displays the complete trade details and P&L

#### Scenario: View all entries for a trade
- **WHEN** user views a trade transaction
- **THEN** the system displays all journal entries associated with that trade
