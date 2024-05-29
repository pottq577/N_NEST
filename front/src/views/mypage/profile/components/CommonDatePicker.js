import React from 'react'
import TextField from '@mui/material/TextField'

import DatePicker from '@mui/lab/DatePicker'
import AdapterDateFns from '@mui/lab/AdapterDateFns'
import LocalizationProvider from '@mui/lab/LocalizationProvider'

const CommonDatePicker = ({ views, label, value, onChange, format }) => (
  <LocalizationProvider dateAdapter={AdapterDateFns}>
    <DatePicker
      views={views}
      label={label}
      inputFormat={format}
      value={value}
      onChange={newDate => {
        if (newDate) {
          const yearMonth = newDate.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' })
          onChange(yearMonth)
        } else {
          onChange(null)
        }
      }}
      renderInput={props => <TextField {...props} />}
    />
  </LocalizationProvider>
)

export default CommonDatePicker