import { AppSelection } from "../../utils/app-selection";

export const WORKSPACE_GROUPS: Array<{
  id: AppSelection;
  routeGroup: string;
}> = [
  { id: "dms-crm", routeGroup: "(crm)" },
  { id: "dms-warehouse", routeGroup: "(warehouse)" },
  { id: "dms-management", routeGroup: "(management)" },
];
