import React from "react";
import { View } from "react-native";
import { DatePickerModal } from "react-native-paper-dates";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { TextInput } from "react-native-paper";
import { formatDate } from "../utils/index";

interface DatePickerProps {
  date: Date;
  setDate: React.Dispatch<React.SetStateAction<Date>>;
}

export default function DatePicker({ date, setDate }: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  const onDismissSingle = React.useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  const onConfirmSingle = React.useCallback(
    (params: any) => {
      setOpen(false);
      setDate(params.date);
    },
    [setOpen, setDate]
  );

  const formatDisplayDate = (date: Date) => {
    return formatDate(date); // "DD/MM/YYYY"
  };
  // TODO alterar idioma e cores tema do calendário
  return (
    <SafeAreaProvider>
      <View>
        <TextInput
          outlineColor="#145B91"
          activeOutlineColor="#145B91"
          mode="outlined"
          style={{
            marginTop: 6,
            backgroundColor: "white",
            fontSize: 14,
            fontFamily: "Roboto",
            height: 50,
          }}
          onFocus={() => setOpen(true)}
          value={formatDisplayDate(date)}
        />
        <DatePickerModal
          disableStatusBarPadding
          locale="pt-BR"
          mode="single"
          visible={open}
          onDismiss={onDismissSingle}
          date={date}
          onConfirm={onConfirmSingle}
        />
      </View>
    </SafeAreaProvider>
  );
}
