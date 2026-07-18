import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormHelperText from "@mui/material/FormHelperText";
import FormControl from "@mui/material/FormControl";
import Select, { type SelectChangeEvent } from "@mui/material/Select";

interface Props {
  name: string;
  value: number | string;
  id: string;
  options: string[];
  text_color: string;
  border_color: string;
  helper: string;
  font_size?: string;
  label_font_size?: string;
  minWidth?: string;
  disabled?: boolean;
  onChange?: (event: SelectChangeEvent) => void;
}

export default function SelectInput({
  name,
  value,
  id,
  options,
  text_color,
  border_color = "white",
  helper = "",
  font_size = "1rem",
  label_font_size = "0.875rem",
  minWidth = "clamp(8rem, 10vw, 12rem)",
  disabled = false,
  onChange,
}: Props) {
  return (
    <div>
      <FormControl
        size="small"
        disabled={disabled}
        sx={{
          m: 0,
          minWidth: minWidth,
          fontFamily: "inherit",
          "& .MuiOutlinedInput-root": {
            borderRadius: "0.25rem",
            color: text_color,
            fontFamily: "inherit",
            fontSize: font_size,
            "& fieldset": {
              borderColor: border_color,
            },
            "&:hover fieldset": {
              borderColor: border_color,
            },
            "&.Mui-focused fieldset": {
              borderColor: border_color,
              borderWidth: "1px",
            },
            "&.Mui-disabled": {
              color: text_color,
              "& fieldset": {
                borderColor: border_color,
              },
            },
          },
          "& .MuiInputBase-input.Mui-disabled": {
            WebkitTextFillColor: text_color,
            color: text_color,
          },
        }}
      >
        {name ? (
          <InputLabel
            id={`${id}-label`}
            sx={{
              color: text_color,
              fontFamily: "inherit",
              fontSize: label_font_size,
              "&.Mui-focused": {
                color: text_color,
              },
              "&.Mui-disabled": {
                color: text_color,
              },
            }}
          >
            {name}
          </InputLabel>
        ) : null}
        <Select
          labelId={name ? `${id}-label` : undefined}
          id={id}
          value={value}
          label={name || undefined}
          notched={name ? undefined : false}
          onChange={onChange}
          disabled={disabled}
          sx={{
            color: text_color,
            fontFamily: "inherit",
            "& .MuiSelect-icon": {
              color: text_color,
              display: disabled ? "none" : undefined,
            },
          }}
        >
          {options.map((option, i) => (
            <MenuItem
              value={i}
              key={`${id}_${i}`}
              sx={{
                fontFamily: "inherit",
                fontSize: font_size,
              }}
            >
              {option}
            </MenuItem>
          ))}
        </Select>
        {helper ? (
          <FormHelperText sx={{ color: text_color, fontSize: label_font_size }}>
            {helper}
          </FormHelperText>
        ) : null}
      </FormControl>
    </div>
  );
}
