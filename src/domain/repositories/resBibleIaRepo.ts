import { ResIaBible } from "../entities/resBible"

export type CreateResRepo = {
  saveResponse(user: ResIaBible): Promise<void>
}
