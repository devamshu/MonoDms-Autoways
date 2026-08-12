import authReducer from "@/app/features/auth/store/auth.slice";
import permissionReducer from "@/app/features/permissions/store/permissions.slice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { AnyAction, Reducer } from "@reduxjs/toolkit";
import { configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import workspaceReducer from "./workspace.slice";

import crmCcdReducer from "../../host/dms-crm/app/features/ccd/store/ccd.slice";
import crmCustomerReducer from "../../host/dms-crm/app/features/customer/store/customer.slice";
import crmDashboardReducer from "../../host/dms-crm/app/features/dashboard/store/dashboard.slice";
import crmDiscountReducer from "../../host/dms-crm/app/features/discount/store/discount.slice";
import crmMasterReducer from "../../host/dms-crm/app/features/master/store/master.slice";
import crmProfileReducer from "../../host/dms-crm/app/features/profile/store/profile.slice";

import managementDashboardReducer from "../../host/dms-management/app/features/dashboard/crm/store/dashboard.slice";
import managementDealerReducer from "../../host/dms-management/app/features/dashboard/dealer/store/dealer.slice";
import {
    default as managementDashboardLogisticReducer,
    default as managementLogisticReducer,
} from "../../host/dms-management/app/features/dashboard/logistic/store/logistic.slice";
import managementServiceReducer from "../../host/dms-management/app/features/dashboard/service/store/service.slice";
import managementSparepartReducer from "../../host/dms-management/app/features/dashboard/sparepart/store/sparepart.slice";
import managementMasterReducer from "../../host/dms-management/app/features/master/store/master.slice";
import managementProfileReducer from "../../host/dms-management/app/features/profile/store/profile.slice";
import managementUsersReducer from "../../host/dms-management/app/features/users/store/users.slice";

import warehouseDashboardReducer from "../../host/dms-warehouse/app/features/dashboard/store/dashboard.slice";
import warehouseMasterReducer from "../../host/dms-warehouse/app/features/master/store/master.slice";
import warehouseOrdersReducer from "../../host/dms-warehouse/app/features/orders/store/orders.slice";
import warehousePartStockReducer from "../../host/dms-warehouse/app/features/parts/store/parts.slice";
import warehouseProfileReducer from "../../host/dms-warehouse/app/features/profile/store/profile.slice";
import warehouseVehicleStockReducer from "../../host/dms-warehouse/app/features/vehicle/store/vehicle.slice";

const persistConfig = {
  key: "root",
  storage: AsyncStorage,
  whitelist: [
    "auth",
    "workspace",
    "profile",
    "crmProfile",
    "warehouseProfile",
    "managementProfile",
  ],
};

export type RootState = {
  auth: ReturnType<typeof authReducer>;
  permission: ReturnType<typeof permissionReducer>;
  workspace: ReturnType<typeof workspaceReducer>;
  crmProfile: ReturnType<typeof crmProfileReducer>;
  crmCustomer: ReturnType<typeof crmCustomerReducer>;
  crmDiscount: ReturnType<typeof crmDiscountReducer>;
  crmDashboard: ReturnType<typeof crmDashboardReducer>;
  crmMaster: ReturnType<typeof crmMasterReducer>;
  crmCcd: ReturnType<typeof crmCcdReducer>;
  warehouseProfile: ReturnType<typeof warehouseProfileReducer>;
  warehouseVehicleStock: ReturnType<typeof warehouseVehicleStockReducer>;
  warehouseMaster: ReturnType<typeof warehouseMasterReducer>;
  warehousePartStock: ReturnType<typeof warehousePartStockReducer>;
  warehouseOrders: ReturnType<typeof warehouseOrdersReducer>;
  warehouseDashboard: ReturnType<typeof warehouseDashboardReducer>;
  managementProfile: ReturnType<typeof managementProfileReducer>;
  managementUsers: ReturnType<typeof managementUsersReducer>;
  managementDashboard: ReturnType<typeof managementDashboardReducer>;
  managementDashboardLogistic: ReturnType<
    typeof managementDashboardLogisticReducer
  >;
  managementMaster: ReturnType<typeof managementMasterReducer>;
  managementSparepart: ReturnType<typeof managementSparepartReducer>;
  managementDealer: ReturnType<typeof managementDealerReducer>;
  managementService: ReturnType<typeof managementServiceReducer>;
  managementLogistic: ReturnType<typeof managementLogisticReducer>;
  profile:
    | ReturnType<typeof crmProfileReducer>
    | ReturnType<typeof warehouseProfileReducer>
    | ReturnType<typeof managementProfileReducer>;
  dashboard:
    | ReturnType<typeof crmDashboardReducer>
    | ReturnType<typeof warehouseDashboardReducer>
    | ReturnType<typeof managementDashboardReducer>;
  customer: ReturnType<typeof crmCustomerReducer> | undefined;
  discount: ReturnType<typeof crmDiscountReducer> | undefined;
  ccd: ReturnType<typeof crmCcdReducer> | undefined;
  master:
    | ReturnType<typeof crmMasterReducer>
    | ReturnType<typeof warehouseMasterReducer>
    | ReturnType<typeof managementMasterReducer>;
  users: ReturnType<typeof managementUsersReducer> | undefined;
  vehicleStock: ReturnType<typeof warehouseVehicleStockReducer> | undefined;
  partStock: ReturnType<typeof warehousePartStockReducer> | undefined;
  orders: ReturnType<typeof warehouseOrdersReducer> | undefined;
};

const rootReducer = (
  state: RootState | undefined,
  action: AnyAction,
): RootState => {
  const activeWorkspace = state?.workspace?.activeWorkspace ?? "crm";

  const authState = authReducer(state?.auth, action);
  const permissionState = permissionReducer(state?.permission, action);
  const workspaceState = workspaceReducer(state?.workspace, action);

  const crmProfileState = crmProfileReducer(state?.crmProfile, action);
  const crmCustomerState = crmCustomerReducer(state?.crmCustomer, action);
  const crmDiscountState = crmDiscountReducer(state?.crmDiscount, action);
  const crmDashboardState = crmDashboardReducer(state?.crmDashboard, action);
  const crmMasterState = crmMasterReducer(state?.crmMaster, action);
  const crmCcdState = crmCcdReducer(state?.crmCcd, action);

  const warehouseProfileState = warehouseProfileReducer(
    state?.warehouseProfile,
    action,
  );
  const warehouseVehicleStockState = warehouseVehicleStockReducer(
    state?.warehouseVehicleStock,
    action,
  );
  const warehouseMasterState = warehouseMasterReducer(
    state?.warehouseMaster,
    action,
  );
  const warehousePartStockState = warehousePartStockReducer(
    state?.warehousePartStock,
    action,
  );
  const warehouseOrdersState = warehouseOrdersReducer(
    state?.warehouseOrders,
    action,
  );
  const warehouseDashboardState = warehouseDashboardReducer(
    state?.warehouseDashboard,
    action,
  );

  const managementProfileState = managementProfileReducer(
    state?.managementProfile,
    action,
  );
  const managementUsersState = managementUsersReducer(
    state?.managementUsers,
    action,
  );
  const managementDashboardState = managementDashboardReducer(
    state?.managementDashboard,
    action,
  );
  const managementDashboardLogisticState = managementDashboardLogisticReducer(
    state?.managementDashboardLogistic,
    action,
  );
  const managementMasterState = managementMasterReducer(
    state?.managementMaster,
    action,
  );
  const managementSparepartState = managementSparepartReducer(
    state?.managementSparepart,
    action,
  );
  const managementDealerState = managementDealerReducer(
    state?.managementDealer,
    action,
  );
  const managementServiceState = managementServiceReducer(
    state?.managementService,
    action,
  );
  const managementLogisticState = managementLogisticReducer(
    state?.managementLogistic,
    action,
  );

  const profileState =
    activeWorkspace === "warehouse"
      ? warehouseProfileReducer(state?.warehouseProfile, action)
      : activeWorkspace === "management"
        ? managementProfileReducer(state?.managementProfile, action)
        : crmProfileReducer(state?.crmProfile, action);

  const dashboardState =
    activeWorkspace === "warehouse"
      ? warehouseDashboardReducer(state?.warehouseDashboard, action)
      : activeWorkspace === "management"
        ? managementDashboardReducer(state?.managementDashboard, action)
        : crmDashboardReducer(state?.crmDashboard, action);

  const customerState =
    activeWorkspace === "crm"
      ? crmCustomerReducer(state?.crmCustomer, action)
      : undefined;

  const discountState =
    activeWorkspace === "crm"
      ? crmDiscountReducer(state?.crmDiscount, action)
      : undefined;

  const ccdState =
    activeWorkspace === "crm"
      ? crmCcdReducer(state?.crmCcd, action)
      : undefined;

  const masterState =
    activeWorkspace === "warehouse"
      ? warehouseMasterReducer(state?.warehouseMaster, action)
      : activeWorkspace === "management"
        ? managementMasterReducer(state?.managementMaster, action)
        : crmMasterReducer(state?.crmMaster, action);

  const usersState =
    activeWorkspace === "management"
      ? managementUsersReducer(state?.managementUsers, action)
      : undefined;

  const vehicleStockState =
    activeWorkspace === "warehouse"
      ? warehouseVehicleStockReducer(state?.warehouseVehicleStock, action)
      : undefined;

  const partStockState =
    activeWorkspace === "warehouse"
      ? warehousePartStockReducer(state?.warehousePartStock, action)
      : undefined;

  const ordersState =
    activeWorkspace === "warehouse"
      ? warehouseOrdersReducer(state?.warehouseOrders, action)
      : undefined;

  return {
    auth: authState,
    permission: permissionState,
    workspace: workspaceState,
    crmProfile: crmProfileState,
    crmCustomer: crmCustomerState,
    crmDiscount: crmDiscountState,
    crmDashboard: crmDashboardState,
    crmMaster: crmMasterState,
    crmCcd: crmCcdState,
    warehouseProfile: warehouseProfileState,
    warehouseVehicleStock: warehouseVehicleStockState,
    warehouseMaster: warehouseMasterState,
    warehousePartStock: warehousePartStockState,
    warehouseOrders: warehouseOrdersState,
    warehouseDashboard: warehouseDashboardState,
    managementProfile: managementProfileState,
    managementUsers: managementUsersState,
    managementDashboard: managementDashboardState,
    managementDashboardLogistic: managementDashboardLogisticState,
    managementMaster: managementMasterState,
    managementSparepart: managementSparepartState,
    managementDealer: managementDealerState,
    managementService: managementServiceState,
    managementLogistic: managementLogisticState,
    profile: profileState,
    dashboard: dashboardState,
    customer: customerState,
    discount: discountState,
    ccd: ccdState,
    master: masterState,
    users: usersState,
    vehicleStock: vehicleStockState,
    partStock: partStockState,
    orders: ordersState,
  };
};

const persistedReducer = persistReducer<RootState, AnyAction>(
  persistConfig,
  rootReducer as Reducer<RootState, AnyAction>,
);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          "persist/PERSIST",
          "persist/REHYDRATE",
          "persist/PURGE",
          "persist/FLUSH",
          "profile/updateImage/pending",
          "profile/updateImage/fulfilled",
          "profile/updateImage/rejected",
        ],
        ignoredActionPaths: ["rehydrate", "meta.arg"],
      },
    }),
});

export const persistor = persistStore(store);
export type AppDispatch = typeof store.dispatch;
