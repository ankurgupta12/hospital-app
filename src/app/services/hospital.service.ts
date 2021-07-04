import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  IHospitalData,
  IDepartmentData,
  IResponseData,
} from '../models/ihospitaldepartment';

@Injectable({
  providedIn: 'root',
})
export class HospitalService {
  public baseUrl = 'http://localhost:5000';
  constructor(private http: HttpClient) {}

  /**
   * GET api call for hospital data
   * @returns list of hospitals
   */
  public getHospitalData(): Observable<IHospitalData[]> {
    return this.http.get<Array<IHospitalData>>(`${this.baseUrl}/hospital`);
  }

  /**
   * GET api call for department data
   * @returns list of departments
   */
  public getDepartmentData(
    hospitalName: string
  ): Observable<IDepartmentData[]> {
    return this.http.get<Array<IDepartmentData>>(
      `${this.baseUrl}/department/${hospitalName}`
    );
  }

  /**
   *
   * @param name name of the hospital we want to delete
   * @returns observable with the status of api call
   */
  public deleteHospital(name: string): Observable<IResponseData> {
    return this.http.delete<IResponseData>(`${this.baseUrl}/hospital/${name}`);
  }

  /**
   *
   * @param name name of the department we want to delete
   * @returns observable with the status of api call
   */
  public deleteDepartment(data: IDepartmentData): Observable<IResponseData> {
    return this.http.delete<IResponseData>(
      `${this.baseUrl}/department/${data.departmentname}/${data.hospitalname}`
    );
  }

  /**
   *
   * @param data hospital object that needs to be modified
   * @returns observable
   */
  public updateHospitalData(data: IHospitalData): Observable<IResponseData> {
    return this.http.patch<IResponseData>(
      `${this.baseUrl}/hospital/${data.hospitalname}`,
      data
    );
  }

  /**
   *
   * @param data department object that needs to be modified
   * @returns observable
   */
  public updateDepartmentData(
    data: IDepartmentData
  ): Observable<IResponseData> {
    return this.http.patch<IResponseData>(
      `${this.baseUrl}/department/${data.departmentname}`,
      data
    );
  }

  /**
   *  POST - api method
   * @param data hospital data object
   * @returns observable
   */
  public addHospitalData(data: IHospitalData): Observable<IResponseData> {
    return this.http.post<IResponseData>(`${this.baseUrl}/hospital`, data);
  }

  /**
   *  POST - api method
   * @param data department data object
   * @returns observable
   */
  public addDepartmentData(data: IDepartmentData): Observable<IResponseData> {
    return this.http.post<IResponseData>(`${this.baseUrl}/department`, data);
  }
}
