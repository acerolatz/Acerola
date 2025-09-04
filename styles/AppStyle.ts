import { TypographyStyle } from "./TypographyStyle";
import { UtilitiesStyle } from "./UtilitiesStyle";
import { ButtonsStyle } from "./ButtonsStyle";
import { InputsStyle } from "./InputsStyle";
import { StyleSheet } from "react-native";
import { GridStyle } from "./GridStyle";


export const AppStyle = StyleSheet.create({
  ...InputsStyle,
  ...ButtonsStyle,
  ...TypographyStyle,
  ...GridStyle,
  ...UtilitiesStyle,
});
