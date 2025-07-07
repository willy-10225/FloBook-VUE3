import jwt from "jsonwebtoken"
import type { JwtPayload } from "jsonwebtoken"
const EXPIRATION = 7 * 24 * 60 * 60 // 7 days
const key = "secretkey"

export interface UserDetail {
  account: string
  displayName: string
  email: string
  isAdmin: boolean
  name: string
  roles: string[] // 如果 roles 是字串陣列，否則你可以調整
  userId: number
}

export interface TokenPayload extends JwtPayload {
  exp: number
  userName: string
  userInfo: UserDetail
  deviceIpList: string[] // 如果 IP 是字串，例如 "192.168.1.1"
}

export default {
  createToken(payload: TokenPayload): string {
    payload.exp = Math.floor(Date.now() / 1000) + EXPIRATION
    return jwt.sign(payload, key)
  },
  verifyToken(token: string): Promise<TokenPayload> {
    return new Promise((resolve, reject) => {
      jwt.verify(token, key, (err, decoded) => {
        if (err) {
          reject(err)
        } else {
          resolve(decoded as TokenPayload)
        }
      })
    })
  },
}
