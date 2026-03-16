import Array "mo:core/Array";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import Map "mo:core/Map";
import List "mo:core/List";



actor {
  type VocabEntry = {
    word : Text;
    definition : Text;
  };

  type VocabSet = {
    id : Text;
    name : Text;
    entries : [VocabEntry];
  };

  type GameResult = {
    studentName : Text;
    setId : Text;
    setName : Text;
    gameType : Text;
    score : Nat;
    total : Nat;
    timestamp : Int;
  };

  let vocabSets = Map.empty<Text, VocabSet>();
  let gameResults = List.empty<GameResult>();

  public shared ({ caller }) func createVocabSet(id : Text, name : Text, entries : [VocabEntry]) : async () {
    if (vocabSets.containsKey(id)) {
      Runtime.trap("Vocab set with this id already exists");
    };
    let vocabSet : VocabSet = { id; name; entries };
    vocabSets.add(id, vocabSet);
  };

  public shared ({ caller }) func updateVocabSet(id : Text, entries : [VocabEntry]) : async () {
    switch (vocabSets.get(id)) {
      case (null) { Runtime.trap("Vocab set does not exist") };
      case (?existingSet) {
        let updatedSet : VocabSet = {
          id = existingSet.id;
          name = existingSet.name;
          entries;
        };
        vocabSets.add(id, updatedSet);
      };
    };
  };

  public shared ({ caller }) func deleteVocabSet(id : Text) : async () {
    if (not vocabSets.containsKey(id)) {
      Runtime.trap("Vocab set does not exist");
    };
    vocabSets.remove(id);
  };

  public query ({ caller }) func getVocabSet(id : Text) : async VocabSet {
    switch (vocabSets.get(id)) {
      case (null) { Runtime.trap("Vocab set does not exist") };
      case (?set) { set };
    };
  };

  public query ({ caller }) func listVocabSets() : async [(Text, Text)] {
    vocabSets.entries().toArray().map(func((id, set)) { (id, set.name) });
  };

  public shared ({ caller }) func recordGameResult(studentName : Text, setId : Text, setName : Text, gameType : Text, score : Nat, total : Nat) : async () {
    let result : GameResult = {
      studentName;
      setId;
      setName;
      gameType;
      score;
      total;
      timestamp = Time.now();
    };
    gameResults.add(result);
  };

  public query ({ caller }) func listGameResults() : async [GameResult] {
    gameResults.toArray().reverse();
  };

  public shared ({ caller }) func clearGameResults() : async () {
    gameResults.clear();
  };
};
