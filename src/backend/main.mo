import Array "mo:core/Array";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";

actor {
  type VocabEntry = {
    word : Text;
    definition : Text;
  };

  type VocabSet = {
    name : Text;
    entries : [VocabEntry];
  };

  let vocabSets = Map.empty<Text, VocabSet>();

  // Create a new vocab set
  public shared ({ caller }) func createVocabSet(id : Text, name : Text, entries : [VocabEntry]) : async () {
    if (vocabSets.containsKey(id)) {
      Runtime.trap("Vocab set with this id already exists");
    };
    let newSet : VocabSet = {
      name;
      entries;
    };
    vocabSets.add(id, newSet);
  };

  // Update a vocab set's entries
  public shared ({ caller }) func updateVocabSet(id : Text, entries : [VocabEntry]) : async () {
    switch (vocabSets.get(id)) {
      case (null) { Runtime.trap("Vocab set does not exist") };
      case (?existingSet) {
        let updatedSet : VocabSet = {
          name = existingSet.name;
          entries;
        };
        vocabSets.add(id, updatedSet);
      };
    };
  };

  // Delete a vocab set
  public shared ({ caller }) func deleteVocabSet(id : Text) : async () {
    if (not vocabSets.containsKey(id)) {
      Runtime.trap("Vocab set does not exist");
    };
    vocabSets.remove(id);
  };

  public query ({ caller }) func listVocabSets() : async [(Text, Text)] {
    vocabSets.entries().toArray().map(func((id, set)) { (id, set.name) });
  };

  public query ({ caller }) func getVocabSet(id : Text) : async VocabSet {
    switch (vocabSets.get(id)) {
      case (null) { Runtime.trap("Vocab set does not exist") };
      case (?set) { set };
    };
  };
};
