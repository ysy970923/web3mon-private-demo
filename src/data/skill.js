export const LASTINGEFFECT = {
    ContinuousAttack: 'ContinuousAttack',
    DamageMultiple: 'DamageMultiple',
}

export const SPECIALEFFECT = {
    Cleanse: 'Cleanse',
    NullifyIfSkillIsIn: 'NullifyIfSkillIsIn',
    Critical: 'Critical',
    ReflectIfOpSkillIsIn: 'ReflectIfOpSkillIsIn',
}

export const SKILLS = {
    DeathSpiral: 'DeathSpiral',
    CelsiusExplosion: 'CelsiusExplosion',
    BlockOfFud: 'BlockOfFud',
    Hacked: 'Hacked',
    FTTTsunami: 'FTTTsunami',
    FallOfVoyager: 'FallOfVoyager',
    HardForkArrow: 'HardForkArrow',
    ShortSelling: 'ShortSelling',
    PowShield: 'PowShield',
    MergeWall: 'MergeWall',
    AuditField: 'AuditField',
    GraceOfCz: 'GraceOfCz',
    WithdrawalCloak: 'WithdrawalCloak',
    ProofOfReserve: 'ProofOfReserve',
    BTCArmor: 'BTCArmor',
    SelfCustody: 'SelfCustody',
}

export const ATTACKS = [
    SKILLS.DeathSpiral,
    SKILLS.CelsiusExplosion,
    SKILLS.BlockOfFud,
    SKILLS.Hacked,
    SKILLS.FTTTsunami,
    SKILLS.FallOfVoyager,
    SKILLS.HardForkArrow,
    SKILLS.ShortSelling,
]

export const DEFENCES = [
    SKILLS.PowShield,
    SKILLS.MergeWall,
    SKILLS.AuditField,
    SKILLS.GraceOfCz,
    SKILLS.WithdrawalCloak,
    SKILLS.ProofOfReserve,
    SKILLS.BTCArmor,
    SKILLS.SelfCustody,
]

export const SKILL_INFOS = {
    DeathSpiral: {
        name: 'Death Spiral',
        atk: '10AD',
        effect: 'Fever Time',
        effect_desc: 'AD×2 for 3 turns on Both Players',
        img: 'death spiral.png',
    },
    CelsiusExplosion: {
        name: 'Celsius Explosion',
        atk: '20AD',
        effect: 'Critical',
        effect_desc: '25% chance to deal 2×AD damage',
        img: 'celsius explosion.png',
    },
    BlockOfFud: {
        name: 'Block of Fud',
        atk: '20AD',
        effect: 'Cancel',
        effect_desc: 'Cancel Defence if the opponent uses "BTC Armor", "Withdrawls Cloak". \nBut Attack Canceled if opponent uses "Grace of CZ" or "Proof of Reserve"',
        img: 'block of fud.png',
    },
    Hacked: {
        name: 'Hacked',
        atk: '20AD',
        effect: 'Cancel',
        effect_desc: 'Cancel Defence if the opponent uses "BTC Armor", "Withdrawls Cloak". \nBut Attack Canceled if opponent uses "Grace of CZ" or "Proof of Reserve"',
        img: 'hacked.png',
    },
    FTTTsunami: {
        name: 'FTT Tsunami',
        effect: 'Poison',
        effect_desc: 'For the next three turns(including the current turn), 20AD is continuously given to the opponent. However, the user also receives 10AD for the following turns',
        img: 'ftt tsunami.png',
    },
    FallOfVoyager: {
        name: 'Fall of Voyager',
        atk: '20AD',
        effect: 'Fever Time',
        effect_desc: 'AD×2 for 3 turns on Both Players. Available only for until Round 4.',
        img: 'fall of voyager.png',
    },
    HardForkArrow: {
        name: 'Hard Fork Arrow',
        atk: '20AD',
        effect: 'Critical',
        effect_desc: '50% chance to deal 2×AD damage',
        img: 'hard fork arrow.png',
    },
    ShortSelling: {
        name: 'Short Selling',
        effect: 'Poison',
        effect_desc: 'For the next three turns(including the current turn), 10AD is continuously given to the opponent.',
        img: 'short selling.png',
    },
    PowShield: {
        name: 'POW Shield',
        def: '5AD (100%)',
        img: 'pow shield.png',
    },
    MergeWall: {
        name: 'Merge Wall',
        def: '50% (50%)',
        img: 'merge wall.png',
    },
    AuditField: {
        name: 'Audit Field',
        def: '20% (100%)',
        img: 'audit field.png',
    },
    GraceOfCz: {
        name: 'Grace of CZ',
        def: '100% (10%)',
        effect: 'Cleanse',
        effect_desc: 'Remove all Lasting Effects on both players',
        img: 'grace of cz.png',
    },
    WithdrawalCloak: {
        name: 'Withdrawals Cloak',
        effect: 'Poison',
        effect_desc: 'For the next three turns(including the current turn), 10AD is continuously given to the opponent. However, the user also receives 8AD for the following turns',
        img: 'withdrawls cloak.png',
    },
    ProofOfReserve: {
        name: 'Proof of Reserve',
        effect: 'Mirror',
        effect_desc: 'Reflect if opponent uses <FTT Tsunami>, <Fall of Voyager>',
        img: 'proof of reserve.png',
    },
    BTCArmor: {
        name: 'BTC Armor',
        def: '100% (50%)',
        img: 'btc armor.png',
    },
    SelfCustody: {
        name: 'Self Custody',
        effect: 'Cleanse',
        effect_desc: 'Remove all Lasting Effects on me',
        img: 'self custody.png',
    },
}

export const SKILL_RENDER_TYPE = {
    ON_CASTER: 0,
    ON_RECEIVER: 1,
    CASTER_TO_RECEIVER: 2,
}