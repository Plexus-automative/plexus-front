// assets
import { Calendar } from '@wandersonalwes/iconsax-react';

// ==============================|| OVERRIDES - DATE PICKER ||============================== //

export default function DatePicker() {
  return {
    MuiDatePicker: {
      defaultProps: {
        slots: { openPickerIcon: () => <Calendar /> }
      }
    }
  };
}
