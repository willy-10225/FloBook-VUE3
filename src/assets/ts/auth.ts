import { jwtDecode } from "jwt-decode"

const EXPIRATION = 7 * 24 * 60 * 60 // 7 天（秒）
const key = "secretkey" // ⚠️ 這在 jwt-decode 中其實沒用，因為不驗證簽名

export interface UserDetail {
  account: string
  displayName: string
  email: string
  isAdmin: boolean
  name: string
  roles: string[]
  userId: number
}

export interface TokenPayload {
  exp: number
  userName: string
  userInfo: UserDetail
  deviceIpList: string[]
}

function base64Encode(obj: object) {
  return btoa(unescape(encodeURIComponent(JSON.stringify(obj))))
}

export default {
  createToken(payload: Omit<TokenPayload, "exp">): string {
    const exp = Math.floor(Date.now() / 1000) + EXPIRATION
    const fullPayload = { ...payload, exp }

    // 模擬 jwt 結構：header.payload.signature
    const header = base64Encode({ alg: "HS256", typ: "JWT" })
    const body = base64Encode(fullPayload)
    const fakeSignature = "signature" // 前端沒法算出正確 signature

    return `${header}.${body}.${fakeSignature}`
  },

  verifyToken(token: string): Promise<TokenPayload> {
    return new Promise((resolve, reject) => {
      try {
        const decoded = jwtDecode<TokenPayload>(token)
        const now = Math.floor(Date.now() / 1000)

        if (decoded.exp < now) {
          const err = new Error("TokenExpiredError")
          ;(err as any).name = "TokenExpiredError"
          reject(err)
        } else {
          resolve(decoded)
        }
      } catch (e) {
        reject(e)
      }
    })
  },
}
