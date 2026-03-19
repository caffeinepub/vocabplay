import Array "mo:core/Array";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import List "mo:core/List";
import Map "mo:core/Map";



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

  type StudentAccount = {
    name : Text;
    passwordHash : Text;
    stickers : [Text];
  };

  let vocabSets = Map.empty<Text, VocabSet>();
  let gameResults = List.empty<GameResult>();
  let studentAccounts = Map.empty<Text, StudentAccount>();

  // Helper: Simple password hash (to be replaced with actual hash in production)
  func hashPassword(password : Text) : Text {
    // Simple "hash": reverse string (use real hash function in production)
    password.toArray().reverse().toText();
  };

  // Student Account Management
  public shared ({ caller }) func createStudentAccount(name : Text, password : Text) : async () {
    if (studentAccounts.containsKey(name)) {
      Runtime.trap("Student name already taken");
    };
    let account : StudentAccount = {
      name;
      passwordHash = hashPassword(password);
      stickers = [];
    };
    studentAccounts.add(name, account);
  };

  public shared ({ caller }) func loginStudent(name : Text, password : Text) : async Bool {
    switch (studentAccounts.get(name)) {
      case (null) { false };
      case (?account) {
        account.passwordHash == hashPassword(password);
      };
    };
  };

  public shared ({ caller }) func addStudentSticker(name : Text, password : Text, sticker : Text) : async () {
    let account = verifyStudentCredentials(name, password);
    let updatedAccount : StudentAccount = {
      name = account.name;
      passwordHash = account.passwordHash;
      stickers = account.stickers.concat([sticker]);
    };
    studentAccounts.add(name, updatedAccount);
  };

  public shared ({ caller }) func getStudentStickers(name : Text, password : Text) : async [Text] {
    verifyStudentCredentials(name, password).stickers;
  };

  public shared ({ caller }) func getStudentGameResults(name : Text, password : Text) : async [GameResult] {
    ignore verifyStudentCredentials(name, password);
    let studentResults = gameResults.filter(func(result) { result.studentName == name });
    studentResults.toArray().reverse();
  };

  public query ({ caller }) func listStudentNames() : async [Text] {
    studentAccounts.keys().toArray();
  };

  func verifyStudentCredentials(name : Text, password : Text) : StudentAccount {
    switch (studentAccounts.get(name)) {
      case (null) { Runtime.trap("Student account not found") };
      case (?account) {
        if (account.passwordHash != hashPassword(password)) {
          Runtime.trap("Invalid password");
        };
        account;
      };
    };
  };

  // Vocab Set Management
  public shared ({ caller }) func createVocabSet(id : Text, name : Text, entries : [VocabEntry]) : async () {
    if (vocabSets.containsKey(id)) {
      Runtime.trap("Vocab set with this id already exists");
    };
    let vocabSet : VocabSet = { id; name; entries };
    vocabSets.add(id, vocabSet);
  };

  public shared ({ caller }) func updateVocabSet(id : Text, name : Text, entries : [VocabEntry]) : async () {
    switch (vocabSets.get(id)) {
      case (null) { Runtime.trap("Vocab set does not exist") };
      case (?existingSet) {
        let updatedSet : VocabSet = {
          id = existingSet.id;
          name;
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

  // Game Results
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
