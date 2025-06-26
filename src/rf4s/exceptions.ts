
/**
 * Exception classes for RF4S automation.
 */

export class FishHookedError extends Error {
  constructor(message = "A fish is hooked during a wrong routine.") {
    super(message);
    this.name = "FishHookedError";
  }
}

export class FishCapturedError extends Error {
  constructor(message = "A fish is captured during a wrong routine.") {
    super(message);
    this.name = "FishCapturedError";
  }
}

export class LineAtEndError extends Error {
  constructor(message = "Fishing line is at the end during retrieval.") {
    super(message);
    this.name = "LineAtEndError";
  }
}

export class LineSnaggedError extends Error {
  constructor(message = "Fishing line is snagged.") {
    super(message);
    this.name = "LineSnaggedError";
  }
}

export class ItemNotFoundError extends Error {
  constructor(message = "Failed to find an available item for replacement.") {
    super(message);
    this.name = "ItemNotFoundError";
  }
}

export class LureBrokenError extends Error {
  constructor(message = "Lure is broken.") {
    super(message);
    this.name = "LureBrokenError";
  }
}

export class TackleBrokenError extends Error {
  constructor(message = "Tackle is broken.") {
    super(message);
    this.name = "TackleBrokenError";
  }
}

export class DisconnectedError extends Error {
  constructor(message = "Disconnected from the game.") {
    super(message);
    this.name = "DisconnectedError";
  }
}

export class TicketExpiredError extends Error {
  constructor(message = "Ticket expired.") {
    super(message);
    this.name = "TicketExpiredError";
  }
}
