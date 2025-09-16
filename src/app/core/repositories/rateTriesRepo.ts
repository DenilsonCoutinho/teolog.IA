import { NextRequest } from "next/server"

export type limitTriesRepo = {
  checkLimitTries: (req: NextRequest) => Promise<void>
}
