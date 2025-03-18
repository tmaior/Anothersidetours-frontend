import { Box, Flex, Text, Button } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import DashboardLayout from "../../../components/DashboardLayout";
import ScheduleNowIcon from "../../../assets/icons/ScheduleNowIcon";
import ExportIcon from "../../../assets/icons/ExportIcon";
import RunReportIcon from "../../../assets/icons/RunReportIcon";
import ReportsSelectedDatesChip from "../../../components/ReportsSelectedDatesChip";
import SelectDateTypeSwitch from "../../../components/SelectDateTypeSwitch";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import ModalReport from "../../../components/ModalReport";
import { ColDef } from "ag-grid-community";

ModuleRegistry.registerModules([AllCommunityModule]);

export default function Reports() {
  const [startDate] = useState(new Date());
  const [endDate] = useState(new Date());
  const [selectedDateType, setSelectedDateType] = useState("booking");
  const [isScheduleNowOpen, setIsScheduleNowOpen] = useState(false);
  const [rowData, setRowData] = useState([]);

  const fetchReservations = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/reservations`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch reservations");
      }

      const formattedData = data.map((reservation) => ({
        id: reservation.id,
        customerName: reservation.customerName || "N/A",
        tourName: reservation.tour?.name || "N/A",
        date: reservation.date
          ? new Date(reservation.date).toISOString().split("T")[0]
          : "Unknown",
        status: reservation.status || "Unknown",
        addons:
          reservation.reservationAddons
            ?.map((addon) => addon.addon.name)
            .join(", ") || "None",
      }));

      setRowData(formattedData);
    } catch (error) {
      console.error("Error fetching reservations:", error);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const [colDefs, setColDefs] = useState([
    { field: "id", headerName: "ID", sortable: true },
    { field: "customerName", headerName: "Customer" },
    { field: "tourName", headerName: "Tour" },
    { field: "date", headerName: "Date" },
    { field: "status", headerName: "Status" },
    { field: "addons", headerName: "Add-ons" },
  ]);

  const onCloseModal = () => {
    setIsScheduleNowOpen(false);
  };

  return (
    <Box
      width="100vw"
      height="100vh"
      overflowX="hidden"
      marginTop={0}
      padding={0}
    >
      <ModalReport
        openModal={isScheduleNowOpen}
        onCloseModal={onCloseModal}
      ></ModalReport>
      <DashboardLayout>
        <Flex direction="column" sx={{ border: "1px solid #e0e3e7" }}>
          <Flex sx={{ border: "1px solid #e0e3e7" }} padding="12px" gap={4}>
            <Text
              fontSize="2xl"
              fontWeight="bold"
              color="#8a8c91"
              sx={{ cursor: "pointer" }}
            >
              Reports /
            </Text>
            <Text
              fontSize="2xl"
              fontWeight="bold"
              color="#8a8c91"
              sx={{ cursor: "pointer" }}
            >
              Custom Reports /
            </Text>
            <Text fontSize="2xl" fontWeight="bold" sx={{ cursor: "pointer" }}>
              Bookings by Listing
            </Text>
          </Flex>

          <Flex
            sx={{ border: "1px solid #e0e3e7" }}
            padding="10px"
            justifyContent="space-between"
          >
            <Flex gap={5}>
              <SelectDateTypeSwitch
                selectedDateType={selectedDateType}
                selectedOption={(value) => setSelectedDateType(value)}
              />
              <Button> date</Button>
              <Button> select columns </Button>
            </Flex>

            <Flex gap={5}>
              <Button
                variant="outline"
                height="42px"
                padding="18px"
                fontSize="18px"
                onClick={() => setIsScheduleNowOpen(!isScheduleNowOpen)}
              >
                <Flex gap={4} align="center">
                  <ScheduleNowIcon /> Schedule Now
                </Flex>
              </Button>
              <Button
                variant="outline"
                height="42px"
                padding="18px"
                fontSize="18px"
              >
                <Flex gap={4} align="center">
                  <ExportIcon /> Export
                </Flex>
              </Button>
              <Button
                colorScheme="yellow"
                height="42px"
                padding="18px"
                fontSize="18px"
              >
                <Flex gap={4} align="center">
                  <RunReportIcon /> Run Report
                </Flex>
              </Button>
              <Button
                colorScheme="blue"
                height="42px"
                padding="18px"
                fontSize="18px"
              >
                Save
              </Button>
            </Flex>
          </Flex>

          <Flex sx={{ border: "1px solid #e0e3e7" }} padding="10px" gap={2}>
            <Text>Filters: </Text>
            <ReportsSelectedDatesChip
              selectedDateType={selectedDateType}
              startDate={startDate}
              endDate={endDate}
            />
          </Flex>

          <Flex sx={{ border: "1px solid #e0e3e7" }} padding="10px">
            <div
              className="ag-theme-alpine"
              style={{ height: 500, width: "100%" }}
            >
              <AgGridReact rowData={rowData} columnDefs={colDefs} />
            </div>
          </Flex>
        </Flex>
      </DashboardLayout>
    </Box>
  );
}
