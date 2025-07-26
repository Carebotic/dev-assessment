export type Shift = "Early" | "Late" | "Off";

export interface Employee {
  id: string;
  name: string;
}

export type Schedule = {
  [employeeId: string]: {
    [day: string]: Shift;
  };
};
