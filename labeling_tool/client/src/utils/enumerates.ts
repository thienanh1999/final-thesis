export enum SnackBarType {
    Success, Error, Warning, Info
}
export enum SearchType {
    SearchByTitle,
    SearchAllFields,
}

export enum Claim3Type {
    None = -1,
    MoreSpecific = 0,
    Generalization = 1,
    Negation = 2,
    Paraphrasing = 3,
    EntitySubstitution = 4,
}

export enum LabelType {
    Support,
    Refute,
    NotEnoughInfo,
}

export enum GenderType {
    Male = 0,
    Female = 1,
    NonBinary = 2,
}

export enum EvidenceType {
    Table,
    Sentence
}