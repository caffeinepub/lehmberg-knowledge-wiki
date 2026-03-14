import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Map "mo:core/Map";
import Int "mo:core/Int";
import Order "mo:core/Order";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Error "mo:core/Error";
import AccessControl "authorization/access-control";

actor {
  type WikiPage = {
    id : Nat;
    title : Text;
    body : Text;
    tags : [Text];
    createdAt : Int;
    updatedAt : Int;
  };

  type WikiDraft = {
    key : Text;
    title : Text;
    body : Text;
    tags : [Text];
    savedAt : Int;
  };

  module WikiPage {
    public func compare(page1 : WikiPage, page2 : WikiPage) : Order.Order {
      Nat.compare(page1.id, page2.id);
    };
  };

  // Kept to satisfy stable variable compatibility with previous version
  let accessControlState = AccessControl.initState();

  var stablePages : [(Nat, WikiPage)] = [];
  var stableNextId : Nat = 1;
  var stableDrafts : [(Text, WikiDraft)] = [];

  let pages = Map.empty<Nat, WikiPage>();
  var nextId = 1;
  let drafts = Map.empty<Text, WikiDraft>();

  // Restore from stable storage on upgrade
  system func postupgrade() {
    for ((k, v) in stablePages.vals()) {
      pages.add(k, v);
    };
    nextId := stableNextId;
    for ((k, v) in stableDrafts.vals()) {
      drafts.add(k, v);
    };
    stablePages := [];
    stableDrafts := [];
  };

  // Persist to stable storage before upgrade
  system func preupgrade() {
    stablePages := pages.entries().toArray();
    stableNextId := nextId;
    stableDrafts := drafts.entries().toArray();
  };

  // Returns true if a page with this title already exists (optionally excluding a specific id)
  func titleExists(title : Text, excludeId : ?Nat) : Bool {
    let normalised = title.toLower();
    for (page in pages.values()) {
      let skip = switch excludeId {
        case (?eid) { page.id == eid };
        case null { false };
      };
      if (not skip and page.title.toLower() == normalised) {
        return true;
      };
    };
    false;
  };

  public shared ({ caller }) func createPage(title : Text, body : Text, tags : [Text]) : async Nat {
    if (caller.isAnonymous()) {
      throw Error.reject("Authentication required. Please log in to make changes.");
    };
    if (titleExists(title, null)) {
      throw Error.reject("An entry with the title \"" # title # "\" already exists.");
    };
    let id = nextId;
    nextId += 1;
    let now = Time.now();
    let page : WikiPage = { id; title; body; tags; createdAt = now; updatedAt = now };
    pages.add(id, page);
    id;
  };

  public query func getPage(id : Nat) : async ?WikiPage {
    pages.get(id);
  };

  public shared ({ caller }) func updatePage(id : Nat, title : Text, body : Text, tags : [Text]) : async Bool {
    if (caller.isAnonymous()) {
      throw Error.reject("Authentication required. Please log in to make changes.");
    };
    switch (pages.get(id)) {
      case (null) { false };
      case (?existingPage) {
        if (titleExists(title, ?id)) {
          throw Error.reject("An entry with the title \"" # title # "\" already exists.");
        };
        let updatedPage : WikiPage = {
          existingPage with
          title;
          body;
          tags;
          updatedAt = Time.now();
        };
        pages.add(id, updatedPage);
        true;
      };
    };
  };

  public shared ({ caller }) func deletePage(id : Nat) : async Bool {
    if (caller.isAnonymous()) {
      throw Error.reject("Authentication required. Please log in to make changes.");
    };
    switch (pages.get(id)) {
      case (null) { false };
      case (?_) {
        pages.remove(id);
        true;
      };
    };
  };

  public query func listPages() : async [WikiPage] {
    pages.values().toArray().sort();
  };

  public query func getPagesByTag(tag : Text) : async [WikiPage] {
    pages.values().filter(
      func(page) {
        page.tags.find(func(t) { t == tag }) != null;
      }
    ).toArray();
  };

  public query func getPageByTitle(title : Text) : async ?WikiPage {
    pages.values().find(func(page) { Text.equal(page.title, title) });
  };

  // Draft functions — allow anonymous saves so drafts work before login
  public shared func saveDraft(key : Text, title : Text, body : Text, tags : [Text]) : async () {
    let draft : WikiDraft = { key; title; body; tags; savedAt = Time.now() };
    drafts.add(key, draft);
  };

  public query func getDraft(key : Text) : async ?WikiDraft {
    drafts.get(key);
  };

  public shared func deleteDraft(key : Text) : async () {
    drafts.remove(key);
  };

  // Removes duplicate pages (same title, case-insensitive), keeping the one with the lowest id.
  public shared func deduplicatePages() : async Nat {
    var removed = 0;
    let seen = Map.empty<Text, Nat>();
    let allSorted = pages.values().toArray().sort();
    for (page in allSorted.vals()) {
      let key = page.title.toLower();
      switch (seen.get(key)) {
        case (null) { seen.add(key, page.id) };
        case (?_) {
          pages.remove(page.id);
          removed += 1;
        };
      };
    };
    removed;
  };

  public shared func initialize() : async () {
    ignore await deduplicatePages();
  };
};
