declare module '@ericz1803/react-google-calendar' {
  import { CSSProperties } from 'react';
  import { SerializedStyles } from '@emotion/react';

  interface CalendarProps {
    apiKey: string;
    calendars: Array<{
      calendarId: string;
      name?: string;
    }>;
    styles?: {
      calendar?: CSSProperties;
      today?: SerializedStyles;
      eventPopup?: SerializedStyles;
      eventTitle?: SerializedStyles;
      navigation?: SerializedStyles;
      toolbar?: SerializedStyles;
    };
    showFooter?: boolean;
    showNavigation?: boolean;
    showDate?: boolean;
  }

  const Calendar: React.FC<CalendarProps>;
  export default Calendar;
} 