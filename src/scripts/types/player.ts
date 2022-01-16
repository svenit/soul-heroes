import { BaseActorStatus } from './global';


export enum Classess {
    Archer = 'Archer',
    Assassin = 'Assassin',
    Knight = 'Knight',
    Mage = 'Mage',
    Priest = 'Priest',
}
export interface GearOptions {
    body: string;
    face: string;
    eyes?: string;
    skin?: string;
    hair?: string;
    hat?: string;
}

export interface PlayerStatuses extends BaseActorStatus {
    canUseSkill: boolean;
}
