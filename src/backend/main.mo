import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Map "mo:core/Map";
import Int "mo:core/Int";
import Order "mo:core/Order";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
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

  module WikiPage {
    public func compare(page1 : WikiPage, page2 : WikiPage) : Order.Order {
      Nat.compare(page1.id, page2.id);
    };
  };

  // Kept to satisfy stable variable compatibility with previous version
  let accessControlState = AccessControl.initState();

  let pages = Map.empty<Nat, WikiPage>();
  var nextId = 1;

  public shared func createPage(title : Text, body : Text, tags : [Text]) : async Nat {
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

  public shared func updatePage(id : Nat, title : Text, body : Text, tags : [Text]) : async Bool {
    switch (pages.get(id)) {
      case (null) { false };
      case (?existingPage) {
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

  public shared func deletePage(id : Nat) : async Bool {
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

  // No-op: seed data removed, wiki starts empty
  public shared func initialize() : async () {
    ();
  };
};
