import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';
import {
  IColumnConfig,
  IHospitalData,
} from 'src/app/models/ihospitaldepartment';
import { HospitalService } from 'src/app/services/hospital.service';
import { BaseComponent } from '../base-component/base.component';

@Component({
  selector: 'app-hospital-view',
  templateUrl: './hospital-view.component.html',
  styleUrls: ['./hospital-view.component.scss'],
})
export class HospitalViewComponent
  extends BaseComponent
  implements OnInit, OnDestroy
{
  public hospitalData: Array<IHospitalData> = [];
  public columnConfig: Array<IColumnConfig> = [];
  public controls: FormArray = new FormArray([]);
  public addMode = true;
  public addForm: FormGroup = new FormGroup({});
  public loading = true;
  public duplicateCheck: string = '';
  public isAsc = false;
  constructor(private service: HospitalService) {
    super();
  }

  ngOnInit(): void {
    this.initializeConfig();
    this.service
      .getHospitalData()
      .pipe(takeUntil(this.componentDestroyed))
      .subscribe((res) => {
        this.loading = false;
        this.hospitalData = res;
        if (this.hospitalData.length) {
          this.initializeFormObject();
        }
        this.addFormInitilize();
      });
  }

  /**
   * hospital grid config
   */
  private initializeConfig(): void {
    this.columnConfig = [
      {
        title: 'Hospital Name',
        field: 'hospitalname',
      },
      {
        title: 'Contact Number',
        field: 'contactnumber',
      },
    ];
  }

  /**
   * @param index index of form group
   * @param field field name of entity
   * @returns form control
   */
  public getControl(index: number, field: string): FormControl {
    return this.controls.at(index).get(field) as FormControl;
  }

  /**
   * updates the changes made to the particular row
   * @param idx index of the row we want to update
   */
  public saveEdit(index: number): void {
    this.loading = true;
    if (this.controls?.at(index).valid) {
      const rawData = (this.controls.at(index) as FormGroup).getRawValue();
      this.hospitalData[index] = rawData;
    }
    this.service
      .updateHospitalData(this.hospitalData[index] as IHospitalData)
      .pipe(takeUntil(this.componentDestroyed))
      .subscribe(() => {
        this.loading = false;
      });
  }
  /**
   * deletes a particular row
   * @param index index of row we want to delete
   */
  public delete(index: number): void {
    this.loading = true;
    const rawData = (this.controls.at(index) as FormGroup).getRawValue();
    this.hospitalData.splice(index, 1);
    this.service
      .deleteHospital(rawData.hospitalname)
      .pipe(takeUntil(this.componentDestroyed))
      .subscribe(() => {
        this.loading = false;
      });
    if (this.hospitalData.length) {
      this.initializeFormObject();
    }
  }
  /**
   * reset mode
   * @param idx index of the row we want to cancel editing
   */
  public reset(index: number): void {
    this.hospitalData[index].editMode = false;
  }
  /**
   * initiliaze the form array
   */
  private initializeFormObject(): void {
    const formGroup = this.hospitalData.map((entity) => {
      const formControl: any = {};
      this.columnConfig.forEach((col) => {
        formControl[col.field] = new FormControl(
          (entity as any)[col.field],
          Validators.required
        );
      });
      return new FormGroup(formControl);
    });
    this.controls = new FormArray(formGroup);
  }

  /**
   * function used to create the add form controls
   */
  private addFormInitilize(): void {
    const formcontrol: any = {};
    this.columnConfig.forEach((col) => {
      formcontrol[col.field] = new FormControl('', Validators.required);
    });
    this.addForm = new FormGroup(formcontrol);
  }

  /**
   * This used to add the new row
   */
  public add(): void {
    this.addMode = true;
    this.hospitalData.forEach((item) => {
      item.editMode = false;
    });
  }
  /**
   * function used to add a new row in the form
   */
  public addData(): void {
    if (this.addForm.valid) {
      this.loading = true;
      const key = this.columnConfig[0].field;
      const rawData = this.addForm.getRawValue();
      const idx = this.hospitalData.findIndex(
        (entity: any) => entity[key] === rawData[key]
      );
      if (idx !== -1) {
        this.duplicateCheck = 'Field already exists';
        this.addFormInitilize();
        setTimeout(() => {
          this.loading = false;
          this.duplicateCheck = '';
        }, 5000);
        return;
      }
      this.hospitalData.push(rawData);
      this.addFormInitilize();
      this.service
        .addHospitalData(rawData as IHospitalData)
        .pipe(takeUntil(this.componentDestroyed))
        .subscribe(() => {
          this.loading = false;
        });
    }
  }
  /**
   * function used to toggle the sort order between ascending and descending
   */
  public sortByHospitalName(): void {
    this.loading = true;
    this.hospitalData.sort((a, b) =>
      this.isAsc
        ? this.ascending(a, b, 'hospitalname')
        : this.descending(a, b, 'hospitalname')
    );
    this.isAsc = !this.isAsc;
    this.initializeFormObject();
  }

  /**
   * function used to sort array of objects in ascending order
   * @param obj1 first object
   * @param obj2 second object
   * @param key sorting based on key
   * @returns sorting order ascending
   */
  public ascending(obj1: any, obj2: any, key: string): number {
    const first = obj1[key].toUpperCase();
    const second = obj2[key].toUpperCase();
    this.loading = false;
    if (first < second) {
      return -1;
    }
    if (first > second) {
      return 1;
    }
    return 0;
  }

  /**
   * function used to sort array of objects in descending order
   * @param obj1 first object
   * @param obj2 second object
   * @param key sorting based on key
   * @returns sorting order descending
   */
  public descending(obj1: any, obj2: any, key: string): number {
    const first = obj1[key].toUpperCase();
    const second = obj2[key].toUpperCase();
    this.loading = false;
    if (first > second) {
      return -1;
    }
    if (first < second) {
      return 1;
    }
    return 0;
  }

  /**
   * @param field field name of entity
   * @returns form control
   */
  public addControl(field: string): FormControl {
    return this.addForm.get(field) as FormControl;
  }

  public ngOnDestroy(): void {
    super.ngOnDestroy();
  }
}
