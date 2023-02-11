use serde::{Serialize, Deserialize};
use crate::GameMap;

#[derive(Serialize, Deserialize, Debug)]
pub enum WebClientMessage {
    콜  : BoardCastChat { content: String },
    리턴 : BoardCastChat {
        time: String,
        sender_id: usize,
        sender_nickname: String,
        content: String
    },

    콜  : MapChat { content: String },
    리턴 : MapChat {
        time: String,
        sender_id: usize,
        sender_nickname: String,
        content: String
    }, 

    콜  : WhisperChat { content: String, target_id: usize },
    리턴 :  WhisperChat {
        time: String,
        sender_id: usize,
        sender_nickname: String,
        content: String,
    },

    콜 : Move { coordinate: (f32, f32) },
    리턴 : Move {
        mover_id: usize,
        coordinate: Coordinate
    },
    
    콜  : MapTransfer { from: GameMap, to: GameMap },
    리턴 : MapTransfer {
        mover_id: usize,
        from: String,
        to: String
    },

    콜  : RequestBattle { duel_partner_id: usize },
    상대방 유저에게 : BattleOffer {
        opponent_id: ClientKey,
        battle_id: BattleKey
    },
    
    AcceptBattle { challenger_id: usize, battle_id: usize },
    
    RejectBattle { challenger_id: usize, battle_id: usize },
    상대방 유저에게 : BattleReject {
        reason: BattleRejectReason
    },

    배틀이 시작되었을 때 :  BattleInitInfo {
        battle_id: BattleKey,
        player_b_id: ClientKey,
        player_a_id: ClientKey
    },
}