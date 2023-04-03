import { Crew } from './crew'

export interface CrewWithVersion extends Crew {
  deleteDate: Date
  version: number
}
