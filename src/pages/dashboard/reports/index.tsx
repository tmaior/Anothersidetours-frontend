import { Box, Flex, Text, Button } from '@chakra-ui/react'
import React, { useState } from 'react'
import DashboardLayout from '../../../components/DashboardLayout'
import ScheduleNowIcon from '../../../assets/icons/ScheduleNowIcon'
import ExportIcon from '../../../assets/icons/ExportIcon'
import RunReportIcon from '../../../assets/icons/RunReportIcon'
import ReportsSelectedDatesChip from '../../../components/ReportsSelectedDatesChip'
import SelectDateTypeSwitch from '../../../components/SelectDateTypeSwitch'
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community'
import { AgGridReact } from 'ag-grid-react'

import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'
import ModalReport from '../../../components/ModalReport'
import { ColDef } from 'ag-grid-community'

ModuleRegistry.registerModules([AllCommunityModule])

export default function Reports() {
  const [startDate, ] = useState(new Date())
  const [endDate, ] = useState(new Date())
  const [selectedDateType, setSelectedDateType] = useState('booking')
  const [isScheduleNowOpen, setIsScheduleNowOpen] = useState(false)
  const [rowData, ] = useState([
    { make: 'Tesla', model: 'Model Y', price: 64950, electric: true },
    { make: 'Ford', model: 'F-Series', price: 33850, electric: false },
    { make: 'Toyota', model: 'Corolla', price: 29600, electric: false }
  ])

  type CarData = {
    make: string;
    model: string;
    price: number;
    electric: boolean
  }

  const [colDefs, ] = useState<ColDef<CarData>[]>([
    { field: 'make' },
    { field: 'model' },
    { field: 'price' },
    { field: 'electric' }
  ])

  const onCloseModal = () =>{
    setIsScheduleNowOpen(false)
  }

  return (
    <Box
      width="100vw"
      height="100vh"
      overflowX="hidden"
      marginTop={0}
      padding={0}
    >
        <ModalReport openModal={isScheduleNowOpen} onCloseModal={onCloseModal}>
        </ModalReport>
      <DashboardLayout>
        <Flex direction="column" sx={{ border: '1px solid #e0e3e7' }}>
          <Flex sx={{ border: '1px solid #e0e3e7' }} padding="12px" gap={4}>
            <Text
              fontSize="2xl"
              fontWeight="bold"
              color="#8a8c91"
              sx={{ cursor: 'pointer' }}
            >
              Reports /
            </Text>
            <Text
              fontSize="2xl"
              fontWeight="bold"
              color="#8a8c91"
              sx={{ cursor: 'pointer' }}
            >
              Custom Reports /
            </Text>
            <Text fontSize="2xl" fontWeight="bold" sx={{ cursor: 'pointer' }}>
              Bookings by Listing
            </Text>
          </Flex>

          <Flex
            sx={{ border: '1px solid #e0e3e7' }}
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
                onClick={()=> setIsScheduleNowOpen(!isScheduleNowOpen)}
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

          <Flex sx={{ border: '1px solid #e0e3e7' }} padding="10px" gap={2}>
            <Text>Filters: </Text>
            <ReportsSelectedDatesChip
              selectedDateType={selectedDateType}
              startDate={startDate}
              endDate={endDate}
            />
          </Flex>

          <Flex sx={{ border: '1px solid #e0e3e7' }} padding="10px">
            <div
              className="ag-theme-alpine"
              style={{ height: 500, width: '100%' }}
            >
              <AgGridReact<CarData> rowData={rowData} columnDefs={colDefs} />
            </div>
          </Flex>
        </Flex>
      </DashboardLayout>
    </Box>
  )
}
