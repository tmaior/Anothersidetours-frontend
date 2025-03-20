import {
  Box,
  Flex,
  Text,
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import DashboardLayout from "../../../components/DashboardLayout";
import ScheduleNowIcon from "../../../assets/icons/ScheduleNowIcon";
import ExportIcon from "../../../assets/icons/ExportIcon";
import RunReportIcon from "../../../assets/icons/RunReportIcon";
import ReportsSelectedDatesChip from "../../../components/ReportsSelectedDatesChip";
import SelectDateTypeSwitch from "../../../components/SelectDateTypeSwitch";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { format } from "date-fns";
import { DateRangePicker } from "react-date-range";

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import ModalReport from "../../../components/ModalReport";
import { useRef } from "react";

import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

ModuleRegistry.registerModules([AllCommunityModule]);

export default function Reports() {
  const [startDate] = useState(new Date());
  const [endDate] = useState(new Date());
  const [selectedDateType, setSelectedDateType] = useState("booking");
  const [isScheduleNowOpen, setIsScheduleNowOpen] = useState(false);
  const [rowData, setRowData] = useState([]);
  const gridRef = useRef(null);

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
        tourName: reservation.tour?.name || "N/A",
        totalValue: `$${reservation.total_price.toFixed(2)}`,
        hours: reservation.tour?.duration
          ? (reservation.tour.duration / 60).toString()
          : "N/A",
        electricBikeUpgrade: "No",
        tipPercentage: `$${(reservation.total_price * 0.18).toFixed(2)}`,
        roundTripShuttle: "Not included",
      }));

      setRowData(formattedData);
    } catch (error) {
      console.error("Error fetching reservations:", error);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const [colDefs,] = useState([
    {
      field: "tourName",
      headerName: "Tour",
      flex: 2,
      cellStyle: { fontWeight: 'bold' },
    },
    {
      field: "totalValue",
      headerName: "Total Value",
      flex: 1,
    },
    {
      field: "hours",
      headerName: "Hour(s)",
      flex: 1,
    },
    {
      field: "electricBikeUpgrade",
      headerName: "Upgrade to an Electric Bike for FREE?",
      flex: 2,
    },
    {
      field: "tipPercentage",
      headerName: "18%",
      flex: 1,
    },
    {
      field: "roundTripShuttle",
      headerName: "Round-Trip Shuttle @ $50 per guest. (10 Miles Max.)",
      flex: 2,
    },
  ]);

  const onCloseModal = () => {
    setIsScheduleNowOpen(false);
  };

  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);

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
              <Popover placement="bottom-start">
                <PopoverTrigger>
                  <Button>
                    {format(dateRange[0].startDate, "MMM dd, yyyy")} -{" "}
                    {format(dateRange[0].endDate, "MMM dd, yyyy")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent p={0} width="auto">
                  <DateRangePicker
                    ranges={dateRange}
                    onChange={(item) => setDateRange([item.selection])}
                    showSelectionPreview={true}
                    moveRangeOnFirstSelection={false}
                    months={2}
                    direction="horizontal"
                  />
                </PopoverContent>
              </Popover>
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

              <Flex gap={4} align="center">
                <Button
                  variant="outline"
                  height="42px"
                  padding="18px"
                  fontSize="18px"
                  onClick={() => gridRef.current.api.exportDataAsCsv()}
                >
                  <Flex gap={4} align="center">
                    <ExportIcon /> Export
                  </Flex>
                </Button>
              </Flex>

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
              style={{
                height: "auto",
                width: "100%",
                fontSize: "16px",
                border: "none",
                background: "transparent",
              }}
            >
              <AgGridReact
                ref={gridRef}
                rowData={rowData}
                columnDefs={colDefs}
                defaultColDef={{
                  flex: 1,
                  cellStyle: {
                    display: "flex",
                    alignItems: "center",
                    border: "none",
                    padding: "10px",
                  },
                }}
                domLayout="autoHeight"
              />
            </div>
          </Flex>
        </Flex>
      </DashboardLayout>
    </Box>
  );
}
