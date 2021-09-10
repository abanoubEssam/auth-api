import { AppRoles } from "../constants";

export class Principal {
  constructor(public user: {id: string , role: AppRoles , userId: string}, public role: AppRoles) {}
}
