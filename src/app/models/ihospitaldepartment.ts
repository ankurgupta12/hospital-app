export interface IHospitalData {
  hospitalname: string;
  contactnumber: string;
  editMode?: boolean;
}

export interface IDepartmentData extends IHospitalData {
  departmentname: string;
  head: string;
}

export interface IColumnConfig {
  title: string;
  field: string;
}

export interface IResponseData {
  success: boolean;
  msg: string;
}
