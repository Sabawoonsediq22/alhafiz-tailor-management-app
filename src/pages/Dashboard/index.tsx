import {
  Clock,
  User,
  ClipboardList,
  Package,
  BarChart3,
  TriangleAlert,
  DollarSign,
} from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="rounded-lg border border-border bg-card text-card-foreground shadow-sm">
        <div className="flex flex-col space-y-1.5 p-6">
          <h2 className="text-lg font-semibold leading-none tracking-tight">{t("dashboard.welcome")}</h2>
          <p className="text-sm text-muted-foreground">{t("dashboard.quickActions")}</p>
        </div>
        {/* Quick action buttons */}
        <div className="p-6 pt-0">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Link
              to="/customers?newCustomer=true"
              className="flex items-center gap-4 rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
            >
              <div className="flex items-center gap-4">
                <div className="rounded-lg bg-green-100 p-3 dark:bg-green-900/30">
                  <User className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {t("dashboard.newCustomer")}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Add a new customer
                  </p>
                </div>
              </div>
            </Link>

            <Link
              to="/orders"
              className="flex items-center gap-4 rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
            >
              <div className="rounded-lg bg-blue-100 p-3 dark:bg-blue-900/30">
                 <ClipboardList className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {t("dashboard.orders")}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t("dashboard.viewAllOrders")}
                </p>
              </div>
            </Link>

            <Link
              to="/inventory"
              className="flex items-center gap-4 rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
            >
              <div className="rounded-lg bg-orange-100 p-3 dark:bg-orange-900/30">
                 <Package className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {t("nav.inventory")}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Manage inventory
                </p>
              </div>
            </Link>

            <Link
              to="/reports"
              className="flex items-center gap-4 rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
            >
              <div className="rounded-lg bg-primary/10 p-3">
                 <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {t("dashboard.reports")}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t("dashboard.viewAllReports")}
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-border bg-card text-card-foreground shadow-sm">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {t("dashboard.todayOrders")}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  0
                </p>
              </div>
              <div className="rounded-full bg-primary/10 p-3">
                 <ClipboardList className="h-6 w-6 text-primary" />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card text-card-foreground shadow-sm">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {t("dashboard.pendingOrders")}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  0
                </p>
              </div>
              <div className="rounded-full bg-yellow-100 p-3 dark:bg-yellow-900/30">
                <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card text-card-foreground shadow-sm">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {t("dashboard.lowStockItems")}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  0
                </p>
              </div>
              <div className="rounded-full bg-red-100 p-3 dark:bg-red-900/30">
                 <TriangleAlert className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card text-card-foreground shadow-sm">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {t("dashboard.earnings.today")}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ؋ 0
                </p>
              </div>
              <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/30">
                 <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="rounded-lg border border-border bg-card text-card-foreground shadow-sm">
        <div className="flex flex-col space-y-1.5 p-6">
          <h2 className="text-lg font-semibold leading-none tracking-tight">{t("dashboard.recentOrders")}</h2>
        </div>
        <div className="p-6 pt-0">
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            {t("common.noData")}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
