import React, { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import UnifiedWorkflowModal from "../../components/ui/UnifiedWorkflowModal";
import customerAvatar from "@/components/ui/CustomerAvatar";
import CustomerFilters from "../../components/ui/CustomerFilters";
import CustomerActionMenu from "../../components/ui/CustomerActionMenu";
import MeasurementViewModal from "../../components/ui/MeasurementViewModal";
import {
  CloseIcon,
  SearchIcon,
  CreateIcon,
  DownloadIcon,
  DeleteIcon,
  UsersIcon,
} from "../../components/ui/Icons";
import useCustomers from "../../hooks/useCustomers";
import { Button } from "@/components/ui/button";
import { pagination } from "@/components/ui/Pagination";

const Customers: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Check for query param to open unified workflow modal on page load
  const shouldOpenWorkflow = searchParams.get("newCustomer") === "true";

  // Use the useCustomers hook for data management
  const {
    customers,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalPages,
    paginatedCustomers,
    selectedCustomers,
    toggleSelectCustomer,
    toggleSelectAll,
    clearSelection,
    refresh,
    updateCustomer,
    deleteCustomer,
    bulkDelete,
  } = useCustomers();

  // UI state (not in hook - specific to this page)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUnifiedModalOpen, setIsUnifiedModalOpen] =
    useState(shouldOpenWorkflow);
  const [editCustomer, setEditCustomer] = useState<Customer | null>(null);
  const [garmentTypes, setGarmentTypes] = useState<GarmentType[]>([]);

  // For existing customer order creation workflow
  const [orderCustomer, setOrderCustomer] = useState<Customer | null>(null);

  // For new order modal (existing customer - no customer creation step)
  const [
    isExistingCustomerOrderModalOpen,
    setIsExistingCustomerOrderModalOpen,
  ] = useState(false);
  const [existingOrderCustomer, setExistingOrderCustomer] =
    useState<Customer | null>(null);

  // Action menu state for clickable rows
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const [actionMenuCustomer, setActionMenuCustomer] = useState<Customer | null>(
    null,
  );

  // Measurement modal state
  const [isMeasurementModalOpen, setIsMeasurementModalOpen] = useState(false);
  const [measurementCustomerId, setMeasurementCustomerId] =
    useState<string>("");
  const [measurementGarmentTypeId, setMeasurementGarmentTypeId] =
    useState<string>("");
  const [measurementGarmentTypeName, setMeasurementGarmentTypeName] =
    useState<string>("");

  // Delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState<{
    show: boolean;
    customer: Customer | null;
  }>({
    show: false,
    customer: null,
  });

  // Fetch garment types for the unified modal
  useEffect(() => {
    const fetchGarmentTypes = async () => {
      if (window.electronAPI?.garmentTypes) {
        const response = await window.electronAPI.garmentTypes.findAll({
          includeInactive: false,
        });
        if (response.success && response.data) {
          setGarmentTypes(response.data);
        }
      }
    };
    fetchGarmentTypes();
  }, []);

  // Computed values
  const showBulkActions = selectedCustomers.size > 0;

  const stats = useMemo(() => {
    return { totalCustomers: customers.length };
  }, [customers]);

  // Helper function to create customer from workflow data
  const createCustomerFromWorkflow = async (customerData: {
    name: string;
    phone?: string;
    email?: string;
    address?: string;
    notes?: string;
  }) => {
    const response = await window.electronAPI.customers.create(customerData);
    if (!response.success || !response.data) {
      throw new Error(response.error || "Failed to create customer");
    }
    return response.data;
  };

  // Helper function to create order from workflow data
  const createOrderFromWorkflow = async (
    customerId: string,
    orderData: {
      garmentTypeId: string;
      garmentTypeName?: string;
      description: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
      dueDate: string;
      notes: string;
      status: string;
    },
    measurementId?: string,
  ) => {
    const response = (await window.electronAPI.orders.create({
      customerId,
      dueDate: orderData.dueDate ? new Date(orderData.dueDate) : undefined,
      notes: orderData.notes,
      items: [
        {
          garmentTypeId: orderData.garmentTypeId,
          description: orderData.description,
          quantity: orderData.quantity,
          unitPrice: orderData.unitPrice,
          measurementId: measurementId,
          customizations: {
            status: orderData.status,
          },
        },
      ],
    })) as { success: boolean; error?: string };

    if (!response.success) {
      throw new Error(response.error || "Failed to create order");
    }
  };

  // Helper function to create measurement from workflow data
  const createMeasurementFromWorkflow = async (
    customerId: string,
    measurementData: {
      garmentType: string;
      measurementUnit: "cm" | "inch";
      measurements: Record<string, number>;
      fittingNotes: string;
      specialInstructions: string;
    },
  ) => {
    // Convert garment type UUID to name for storage
    // This ensures the measurement is stored with a readable name (e.g., "Shirt")
    // rather than a UUID, which is used for the unique constraint (customer + garmentType)
    const garmentTypeObj = garmentTypes.find(
      (gt) => gt.id === measurementData.garmentType,
    );
    const garmentTypeName = garmentTypeObj?.name || measurementData.garmentType;

    // Combine measurement data with unit info
    const fullMeasurementData = {
      ...measurementData.measurements,
      _unit: measurementData.measurementUnit,
      _fittingNotes: measurementData.fittingNotes,
      _specialInstructions: measurementData.specialInstructions,
    };

    const response = await window.electronAPI.measurements.create({
      customerId,
      garmentType: garmentTypeName,
      measurementData: fullMeasurementData,
    });

    if (!response.success || !response.data) {
      throw new Error(response.error || "Failed to save measurement");
    }

    // Show appropriate feedback based on whether measurement was created or updated
    if (response.updated) {
      // Measurement was updated - show update confirmation
      console.log("Measurement updated successfully");
    }

    return response.data;
  };

  // Handle unified workflow modal completion
  const handleUnifiedWorkflowComplete = async (data: {
    customer: {
      name: string;
      phone?: string;
      email?: string;
      address?: string;
      notes?: string;
    };
    order?: {
      garmentTypeId: string;
      garmentTypeName?: string;
      description: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
      dueDate: string;
      notes: string;
      status: string;
    };
    measurement?: {
      garmentType: string;
      measurementUnit: "cm" | "inch";
      measurements: Record<string, number>;
      fittingNotes: string;
      specialInstructions: string;
    };
  }) => {
    try {
      let customerId: string;

      // Check if we're creating for an existing customer
      if (orderCustomer?.id) {
        customerId = orderCustomer.id;
      } else {
        // Create new customer
        const newCustomer = await createCustomerFromWorkflow(data.customer);
        customerId = newCustomer.id;
      }

      let measurementId: string | undefined;

      // Create measurement if measurement data is provided (before order so we can link)
      if (data.measurement) {
        const measurement = await createMeasurementFromWorkflow(
          customerId,
          data.measurement,
        );
        measurementId = measurement.id;
      }

      // Create order if order data is provided
      if (data.order) {
        await createOrderFromWorkflow(customerId, data.order, measurementId);
      }

      // Refresh the customers list to show the new customer (only if new customer was created)
      if (!orderCustomer?.id) {
        await refresh();
      }

      setIsUnifiedModalOpen(false);
      setOrderCustomer(null);
    } catch (error) {
      console.error("Failed to complete workflow:", error);
      throw error;
    }
  };

  const handleUpdateCustomer = async (
    id: string,
    customerData: {
      name: string;
      phone?: string;
      email?: string;
      address?: string;
      notes?: string;
    },
  ) => {
    try {
      await updateCustomer(id, customerData);
      setIsModalOpen(false);
      setEditCustomer(null);
    } catch (error) {
      console.error("Failed to update customer:", error);
      throw error;
    }
  };

  const handleDeleteCustomer = async () => {
    if (!deleteConfirm.customer) return;

    try {
      await deleteCustomer(deleteConfirm.customer.id);
      setDeleteConfirm({ show: false, customer: null });
    } catch (error) {
      console.error("Failed to delete customer:", error);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleViewAllOrders = (customerId: string) => {
    navigate(`/orders?customerId=${customerId}`);
  };

  const handleViewMeasurements = (
    customerId: string,
    garmentTypeId: string,
  ) => {
    const garmentType = garmentTypes.find((gt) => gt.id === garmentTypeId);
    if (garmentType) {
      setMeasurementCustomerId(customerId);
      setMeasurementGarmentTypeId(garmentTypeId);
      setMeasurementGarmentTypeName(garmentType.name);
      setIsMeasurementModalOpen(true);
    }
  };

  const handleEdit = (customer: Customer) => {
    setEditCustomer(customer);
    setIsModalOpen(true);
  };

  // Handle creating new order for existing customer
  const handleCreateOrderForCustomer = (customer: Customer) => {
    setExistingOrderCustomer(customer);
    setIsExistingCustomerOrderModalOpen(true);
  };

  // Handle existing customer order modal completion
  const handleExistingCustomerOrderComplete = async () => {
    setIsExistingCustomerOrderModalOpen(false);
    setExistingOrderCustomer(null);
    // Refresh orders if needed - the order was created in the modal
  };

  const handleDelete = (customer: Customer) => {
    setDeleteConfirm({ show: true, customer });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (items: number) => {
    setItemsPerPage(items);
  };

  // Handle row click for action menu
  const handleRowClick = (customer: Customer) => {
    setActionMenuCustomer(customer);
    setIsActionMenuOpen(true);
  };

  // Handle checkbox click - stop propagation to prevent row click
  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditCustomer(null);
  };

  // Export to CSV
  const [isExporting, setIsExporting] = useState(false);
  const handleExportCSV = async () => {
    try {
      setIsExporting(true);
      const customersToExport =
        selectedCustomers.size > 0
          ? customers.filter((c) => selectedCustomers.has(c.id))
          : customers;

      const headers = [
        "Name",
        "Phone",
        "Email",
        "Address",
        "Notes",
        "Created At",
      ];
      const rows = customersToExport.map((c) => [
        c.name,
        c.phone || "",
        c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "",
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map((row) =>
          row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","),
        ),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `customers_${new Date().toISOString().split("T")[0]}.csv`,
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Show success feedback
      alert(t("customers.exportSuccess"));
    } catch (error) {
      console.error("Failed to export CSV:", error);
    } finally {
      setIsExporting(false);
    }
  };

  // Bulk delete
  const [isDeleting, setIsDeleting] = useState(false);
  const handleBulkDelete = async () => {
    if (selectedCustomers.size === 0) return;
    const confirmed = window.confirm(
      t("customers.deleteWarning", {
        name: `${selectedCustomers.size} customers`,
      }),
    );
    if (!confirmed) return;
    try {
      setIsDeleting(true);
      await bulkDelete(Array.from(selectedCustomers));
    } catch (error) {
      console.error("Failed to delete customers:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Bulk Actions Bar */}
      {showBulkActions && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
              {t("customers.selectedCustomers", {
                count: selectedCustomers.size,
              })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<DownloadIcon className="w-4 h-4" />}
              onClick={handleExportCSV}
              disabled={isExporting}
            >
              {t("customers.exportSelected")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<DeleteIcon className="w-4 h-4" />}
              onClick={handleBulkDelete}
              disabled={isDeleting}
            >
              {t("customers.deleteSelected")}
            </Button>
            <Button variant="ghost" size="icon" onClick={clearSelection}>
              <CloseIcon className="w-5 h-5" />
            </Button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t("customers.title")}
        </h1>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
          {/* Search Bar */}
          <div className="w-full sm:w-64 lg:w-80">
            <div className="relative">
              <input
                type="text"
                placeholder={t("customers.searchPlaceholder")}
                value={searchQuery}
                onChange={handleSearch}
                className="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>
          <CustomerFilters sortBy={sortBy} onSortChange={setSortBy} />
          <Button
            variant="default"
            leftIcon={<CreateIcon className="w-4 h-4" />}
            onClick={() => setIsUnifiedModalOpen(true)}
          >
            {t("customers.addNew")}
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        <span>{t("customers.totalCustomers")}:</span>
        <span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full px-2 py-0.5 text-xs font-medium">
          {stats.totalCustomers}
        </span>
      </div>

      {/* Customer List */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          {error ? (
            <div className="text-center py-8 text-red-500 dark:text-red-400">
              {t("common.error")}: {error}
            </div>
          ) : isLoading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-500 dark:text-gray-400">
                {t("common.loading")}
              </p>
            </div>
          ) : customers.length === 0 ? (
            <div className="text-center py-12">
              <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                {t("customers.noCustomers")}
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {t("customers.getStarted")}
              </p>
              <div className="mt-6">
                <Button
                  variant="default"
                  leftIcon={<CreateIcon className="w-4 h-4" />}
                  onClick={() => setIsUnifiedModalOpen(true)}
                >
                  {t("customers.addNew")}
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Table View */}
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-10">
                      <input
                        type="checkbox"
                        checked={
                          selectedCustomers.size ===
                            paginatedCustomers.length &&
                          paginatedCustomers.length > 0
                        }
                        onChange={toggleSelectAll}
                        className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 dark:bg-gray-700 cursor-pointer"
                      />
                    </th>
                    <th className="px-6 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t("common.name")}
                    </th>
                    <th className="px-6 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t("common.phone")}
                    </th>
                    <th className="px-6 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t("common.email")}
                    </th>
                    <th className="px-6 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t("common.address")}
                    </th>
                    <th className="px-6 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t("common.createdAt")}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {paginatedCustomers.map((customer) => (
                    <tr
                      key={customer.id}
                      onClick={() => handleRowClick(customer)}
                      className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer ${
                        selectedCustomers.has(customer.id)
                          ? "bg-blue-50 dark:bg-blue-900/20"
                          : ""
                      }`}
                    >
                      <td
                        className="px-4 py-4 whitespace-nowrap"
                        onClick={handleCheckboxClick}
                      >
                        <input
                          type="checkbox"
                          checked={selectedCustomers.has(customer.id)}
                          onChange={() => toggleSelectCustomer(customer.id)}
                          onClick={handleCheckboxClick}
                          className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 dark:bg-gray-700 cursor-pointer"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <CustomerAvatar name={customer.name} size="md" />
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {customer.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {customer.phone || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {customer.email || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                          {customer.address || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {customer.createdAt
                            ? new Date(customer.createdAt).toLocaleDateString()
                            : "-"}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              <pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={customers.length}
                itemsPerPage={itemsPerPage}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
              />
            </>
          )}
        </div>
      </div>

      {/* Edit Customer Modal */}
      <CustomerEditModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onUpdate={handleUpdateCustomer}
        customer={editCustomer}
      />

      {/* Delete Confirmation Dialog */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setDeleteConfirm({ show: false, customer: null })}
          />
          <div className="relative z-10 w-full max-w-md mx-4 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {t("customers.confirmDelete")}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {t("customers.deleteWarning", {
                name: deleteConfirm.customer?.name,
              })}
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() =>
                  setDeleteConfirm({ show: false, customer: null })
                }
              >
                {t("common.cancel")}
              </Button>
              <Button variant="danger" onClick={handleDeleteCustomer}>
                {t("common.delete")}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Unified Workflow Modal for adding new customers with orders/measurements */}
      <UnifiedWorkflowModal
        isOpen={isUnifiedModalOpen}
        onClose={() => {
          setIsUnifiedModalOpen(false);
          setOrderCustomer(null);
        }}
        onComplete={handleUnifiedWorkflowComplete}
        garmentTypes={garmentTypes}
      />

      {/* Existing Customer Order Modal - For creating orders for existing customers */}
      <ExistingCustomerOrderModal
        isOpen={isExistingCustomerOrderModalOpen}
        customer={existingOrderCustomer}
        onClose={() => {
          setIsExistingCustomerOrderModalOpen(false);
          setExistingOrderCustomer(null);
        }}
        onComplete={handleExistingCustomerOrderComplete}
        garmentTypes={garmentTypes}
      />

      {/* Customer Action Menu - Centered modal for row click */}
      <CustomerActionMenu
        customer={actionMenuCustomer}
        isOpen={isActionMenuOpen}
        onClose={() => {
          setIsActionMenuOpen(false);
          setActionMenuCustomer(null);
        }}
        onEdit={handleEdit}
        onCreateOrder={handleCreateOrderForCustomer}
        onViewAllOrders={handleViewAllOrders}
        onDelete={handleDelete}
        onViewMeasurements={handleViewMeasurements}
        garmentTypes={garmentTypes}
        t={t}
      />

      {/* Measurement View/Edit Modal */}
      <MeasurementViewModal
        isOpen={isMeasurementModalOpen}
        customerId={measurementCustomerId}
        garmentTypeId={measurementGarmentTypeId}
        garmentTypeName={measurementGarmentTypeName}
        garmentTypes={garmentTypes}
        onClose={() => {
          setIsMeasurementModalOpen(false);
          setMeasurementCustomerId("");
          setMeasurementGarmentTypeId("");
          setMeasurementGarmentTypeName("");
        }}
      />
    </div>
  );
};

export default Customers;
