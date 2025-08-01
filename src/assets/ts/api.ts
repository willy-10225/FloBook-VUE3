import axios from "axios"
import type { AxiosResponse } from "axios"

let baseDomain = "."
if (import.meta.env.NODE_ENV !== "production") {
  baseDomain = "http://61.219.187.38:100"
  //  baseDomain = 'http://192.168.33.112'
}

const apiAccessor = "api"
const baseURL = `${baseDomain}/${apiAccessor}`

const flobookApi = axios.create({
  baseURL: baseURL,
})

flobookApi.interceptors.request.use(config => {
  if (config.headers) {
    config.headers.set?.("Flobook-License", "1, 1, 0")
  }
  return config
})

flobookApi.interceptors.response.use(
  res => res,
  err => Promise.reject(err)
)
/**
 * Getgroup
 */
export function apiGetgroup() {
  return flobookApi.get("/Getgroup")
}
// TODO: Set to header
/**
 * GetFloBookLicense
 */
export function apiGetFloBookLicense() {
  return flobookApi.get("/GetFloBookLicense")
}

interface LoginPayload {
  AccountName: string
  Password: string
}
export function apiLogin(payload: LoginPayload) {
  return flobookApi.post("/Login", payload)
}
interface AddListPayload {
  ip: string
  name: string
}
export function apiAddList(payload: AddListPayload) {
  return flobookApi.post("/AddList", payload)
}
interface DeleteGroupPayload {
  id: number
}
export function apiDeleteList(ip: DeleteGroupPayload) {
  return flobookApi.post("/DeleteList", ip)
}

export function apiGetList() {
  return flobookApi.get("/GetList")
}
/**
 * AdminConfig
 */
export function apiAdminConfig() {
  return flobookApi.get("/AdminConfig")
}
/**
 * GetAllMembers
 */
export function apiGetAllMembers() {
  return flobookApi.get("/GetAllMembers")
}

interface SetAdminPayload {
  userId: number
  isAdmin: Boolean
}
export function apiSetAdmin(payload: SetAdminPayload) {
  return flobookApi.post("/SetAdmin", payload)
}

interface GetAllGroupsPayload {
  userId: string
}
export function apiGetAllGroups(payload: GetAllGroupsPayload) {
  return flobookApi.post("/GetAllGroups", payload)
}

interface CreateGroupPayload {
  name: string
  originalMembers: Number[]
}
export function apiCreateGroup(payload: CreateGroupPayload) {
  return flobookApi.post("/CreateGroup", payload)
}

interface SetGroupMemberPayload {
  groupNum: Number
  userId: Number
  isIn: Boolean
  isUser: Boolean
  isAdmin: Boolean
}
export function apiSetGroupMember(payload: SetGroupMemberPayload) {
  return flobookApi.post("/SetGroupMember", payload)
}

interface DeleteGroupPayload {
  id: number
}
export function apiDeleteGroup(payload: DeleteGroupPayload) {
  return flobookApi.post("/DeleteGroup", payload)
}

interface IsAccountNameUsablePayload {
  account: String
}
export function apiIsAccountNameUsable(payload: IsAccountNameUsablePayload) {
  return flobookApi.post("/IsAccountNameUsable", payload)
}
/**
 * CreateAccount
 * @param { Object } payload
 * @param { String } payload.account
 * @param { String } payload.password
 * @param { String } payload.displayName
 * @param { String } payload.email
 */
interface CreateAccountPayload {
  account: String
  password: String
  displayName: String
  email: String
}
export function apiCreateAccount(payload: CreateAccountPayload) {
  return flobookApi.post("/CreateAccount", payload)
}
/**
 * ApproveAccount
 * @param { Object } payload
 * @param { Number } payload.id
 * @param { Boolean } payload.approved
 */
interface ApproveAccountPayload {
  id: Number
  approved: Boolean
}
export function apiApproveAccount(payload: ApproveAccountPayload) {
  return flobookApi.post("/ApproveAccount", payload)
}

interface ModifyProfilePayload {
  userId: Number
  displayName: String
  email: String
}
export function apiModifyProfile(payload: ModifyProfilePayload) {
  return flobookApi.post("/ModifyProfile", payload)
}

interface ModifyPasswordPayload {
  userId: Number
  oldPassword: String
  newPassword: String
}
export function apiModifyPassword(payload: ModifyPasswordPayload) {
  return flobookApi.post("/ModifyPassword", payload)
}
/**
 * ModifyProjectPermission
 * @param { Object } payload
 * @param { String } payload.Status
 * @param { Boolean } payload.ReadExcutor
 * @param { Boolean } payload.WriteExcutor
 * @param { Boolean } payload.ReadManager
 * @param { Boolean } payload.WriteManager
 * @param { Boolean } payload.ReadTeam
 * @param { Boolean } payload.WriteTeam
 * @param { Boolean } payload.ReadGroup
 * @param { Boolean } payload.WriteGroup
 */
interface ModifyProjectPermissionPayload {
  Status: String
  ReadExcutor: Boolean
  WriteExcutor: Boolean
  ReadManager: Boolean
  WriteManager: Boolean
  ReadTeam: Boolean
  WriteTeam: Boolean
  ReadGroup: Boolean
  WriteGroup: Boolean
}
export function apiModifyProjectPermission(
  payload: ModifyProjectPermissionPayload
) {
  return flobookApi.post("/ModifyProjectPermission", payload)
}
/**
 * AddProjectInit
 */
export function apiAddProjectInit() {
  return flobookApi.get("/AddProjectInit")
}

interface AddProjectPayload {
  projectDetail: FormData
  projectFiles: FormData
}
export function apiAddProject(payload: AddProjectPayload) {
  return flobookApi.post("/AddProject", payload)
}

interface ProjectListInitPayload {
  id: Number
}
export function apiProjectListInit(payload: ProjectListInitPayload) {
  return flobookApi.post("/ProjectListInit", payload)
}
interface GetProjectByIdPayload {
  id: Number
  userId: Number
}

export function apiGetProjectById(payload: GetProjectByIdPayload) {
  return flobookApi.post("/GetProjectById", payload)
}

interface GetFilePreviewPayload {
  id: Number
}
export function apiGetFilePreview(payload: GetFilePreviewPayload) {
  return flobookApi.post("/GetFilePreview", payload)
}

interface UploadBigFilePayload {
  iprojectFilesd: FormData
}
export function apiUploadBigFile(payload: UploadBigFilePayload) {
  return flobookApi.post("/UploadBigFile", payload)
}

interface ModifyProjectPayload {
  closeTime: String
  customerName: String
  deal: String
  domain: String[]
  executor: String
  id: Number
  industryType: String[]
  projectType: String[]
  software: String[]
  teammates: String[]
  product: String
  projectCreater: String
  projectDescription: String
  projectName: String
  security: String
  startTime: String
  status: String
  manager: String
}
export function apiModifyProject(payload: ModifyProjectPayload) {
  return flobookApi.post("/ModifyProject", payload)
}

/**
 * ModifyCheckPoint
 * @param { Object } payload
 * @param { String } payload.userName
 * @param { Number } payload.projectId
 * @param { Object[] } payload.checkPoints
 * @param { String } payload.checkPoints[].checkPointName
 * @param { Boolean } payload.checkPoints[].isDone
 */
interface CheckPoint {
  checkPointName: string
  isDone: boolean
}

interface ModifyCheckPointPayload {
  userName: string | null // sessionStorage.getItem 可能回傳 null
  projectId: string | null // sessionStorage.getItem 回傳字串，若要數字需要轉型
  checkPoints: CheckPoint[]
}

export function apiModifyCheckPoint(payload: ModifyCheckPointPayload) {
  return flobookApi.post("/ModifyCheckPoint", payload)
}
export interface ModifyFilePayload {
  userName: string
  projectId: number
  files: number[]
}

export function apiModifyFile(payload: ModifyFilePayload) {
  return flobookApi.post("/ModifyFile", payload)
}

export interface DeleteProjectPayload {
  id: number
  userName: string
}

export function apiDeleteProject(payload: DeleteProjectPayload) {
  return flobookApi.post("/DeleteProject", payload)
}
//#endregion

//#region Monitor APIs ----------------------------------------------------------
/**
 * MonitorList
 */
export function apiMonitorList() {
  return flobookApi.get("/MonitorList")
}
/**
 * GetLicensesByIps
 */
export function apiGetLicensesByIps() {
  return flobookApi.get("/GetLicensesByIps")
}

export interface IpPayload {
  ip: string
}
export function apiMonitorDetail(payload: IpPayload) {
  return flobookApi.post("/MonitorDetail", payload)
}
/**
 * GetLicensesListByIp
 * @param { Object } payload
 * @param { String } payload.ip
 */
export function apiGetLicensesListByIp(payload: IpPayload) {
  return flobookApi.post("/GetLicensesListByIp", payload)
}
export interface IpDateRangePayload {
  Ip: string
  Start: string
  End: string
}
export function apiGetHardwareUserListByIp(payload: IpDateRangePayload) {
  return flobookApi.post("/GetHardwareUserListByIp", payload)
}

export interface GetHardwareHistoryPayload {
  ip: string
  user: string
  start: string
  end: string
  time_interval: string
}

export function apiGetHardwareHistory(payload: GetHardwareHistoryPayload) {
  return flobookApi.post("/GetHardwareHistory", payload, { timeout: 1800000 })
}
/**
 * GetLicenseHistory
 * @param { Object } payload
 * @param { Number } payload.ip
 * @param { String } payload.start
 * @param { String } payload.end
 */
export function apiGetLicenseHistory(payload: {
  ip: number
  start: string
  end: string
}) {
  return flobookApi.post("/GetLicenseHistory", payload)
}
/**
 * GetUnnormalUseData
 */
export function apiGetUnnormalUseData() {
  return flobookApi.get("/GetUnnormalUseData")
}
/**
 * SendEmailUnnormalUse
 * @param { Object } payload
 */
export function apiSendEmailUnnormalUse(payload: any) {
  return flobookApi.post("/SendEmailUnnormalUse", payload)
}
/**
 * GetLicenseTop100
 */
export function apiGetLicenseTop100() {
  return flobookApi.get("/GetLicenseTop100")
}
//#endregion

//#region Solve APIs ----------------------------------------------------------
/**
 * GetSolveConfig
 */
export function apiGetSolveConfig() {
  return flobookApi.get("/GetSolveConfig")
}
export interface SolveConfigVersion {
  name: string
  path: string
}

export interface SetSolveConfigPayload {
  maxCpu: number
  ansysIncFolderPath: string
  latestSolverVersion: SolveConfigVersion[]
  computeMode: string
  fileServer: string
  clusterIps: string
}

export function apiSetSolveConfig(payload: SetSolveConfigPayload) {
  return flobookApi.post("/SetSolveConfig", payload)
}
/**
 * GetAllJobs
 * @param { Number } count
 */
export function apiGetAllJobs(count?: number) {
  return count === undefined
    ? flobookApi.get("/GetAllJobs")
    : flobookApi.get(`/GetAllJobs/${count}`)
}
/**
 * InitialJobSubmission
 */
export function apiInitialJobSubmission() {
  return flobookApi.get("/InitialJobSubmission")
}
/**
 * AddJob
 * @param { Object } payload
 * @param { String } payload.name
 * @param { String } payload.version
 * @param { Number } payload.cpuNum
 * @param { Number } payload.gpuNum
 * @param { String } payload.type
 * @param { String } payload.licenses
 * @param { String } payload.user
 * @param { String } payload.inputFile
 */
export function apiAddJob(payload: {
  name: string
  version: string
  cpuNum: number
  gpuNum: number
  type: string
  licenses: string
  user: string
  inputFile: string
}) {
  return flobookApi.post("/AddJob", payload)
}
export interface UploadJobFilePayload {
  jobId: number
  path: string
  total: number
  index: number
  fileName: string
  file: File
}

export function apiUploadJobFile(payload: FormData) {
  return flobookApi.post("/UploadJobFile", payload)
}
/**
 * UploadJobFinished
 * @param { Object } payload
 * @param { Number } paylaod.jobId
 */
export interface UploadJobFinishedPayload {
  jobId: number
}
export function apiUploadJobFinished(payload: UploadJobFinishedPayload) {
  return flobookApi.post("/UploadJobFinished", payload)
}
/**
 * ModifyJobPriority
 * @param { Object } payload
 * @param { Number } payload.jobId
 * @param { String } payload.type {"up", "down", "star"}
 */
export interface ModifyJobPriorityPayload {
  jobId: number
  type: "up" | "down" | "star"
}
export function apiModifyJobPriority(payload: ModifyJobPriorityPayload) {
  return flobookApi.post("/ModifyJobPriority", payload)
}
/**
 * TerminateJob
 * @param { Object } payload
 * @param { Number } payload.jobId
 */
export interface JobIdPayload {
  jobId: number
}
export function apiTerminateJob(payload: JobIdPayload) {
  return flobookApi.post("/TerminateJob", payload)
}
/**
 * DownloadJob
 * @param { Object } payload
 * @param { Number } payload.jobId
 */
export function apiDownloadJob(payload: JobIdPayload) {
  return flobookApi.post("/DownloadJob", payload)
}
//#endregion

/**
 * TerminateLicense
 * @param { Object } payload
 * @param { String } payload.Ip
 * @param { String } payload.Host
 * @param { String } payload.UserName
 * @param { String } payload.Product
 * @param { String } payload.StartTime
 * @param { String } payload.EndTime
 * @param { Number } payload.Task
 * @param { Number } payload.Handle
 */
export interface TerminateLicensePayload {
  Ip: string
  Host: string
  UserName: string
  Product: string
  StartTime: string
  EndTime: string
  Task: number
  Handle: number
  terminating: string
}
export function apiTerminateLicense(payload: TerminateLicensePayload) {
  return flobookApi.post("/TerminateLicense", payload)
}

export default {
  apiGetFloBookLicense,
  apiLogin,
  apiAdminConfig,
  apiGetAllMembers,
  apiSetAdmin,
  apiGetAllGroups,
  apiCreateGroup,
  apiSetGroupMember,
  apiDeleteGroup,
  apiIsAccountNameUsable,
  apiCreateAccount,
  apiApproveAccount,
  apiModifyProfile,
  apiModifyPassword,
  apiModifyProjectPermission,
  apiAddProjectInit,
  apiAddProject,
  apiProjectListInit,
  apiGetProjectById,
  apiGetFilePreview,
  apiUploadBigFile,
  apiModifyProject,
  apiModifyCheckPoint,
  apiModifyFile,
  apiDeleteProject,
  apiMonitorList,
  apiGetLicensesByIps,
  apiMonitorDetail,
  apiGetLicensesListByIp,
  apiGetHardwareUserListByIp,
  apiGetHardwareHistory,
  apiGetLicenseHistory,
  apiGetSolveConfig,
  apiSetSolveConfig,
  apiGetAllJobs,
  apiInitialJobSubmission,
  apiAddJob,
  apiUploadJobFile,
  apiUploadJobFinished,
  apiModifyJobPriority,
  apiTerminateJob,
  apiDownloadJob,
  apiTerminateLicense,
  apiGetUnnormalUseData,
  apiSendEmailUnnormalUse,
  apiGetLicenseTop100,
}
