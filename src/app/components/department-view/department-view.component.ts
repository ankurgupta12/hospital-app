import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import {
  IColumnConfig,
  IDepartmentData,
} from 'src/app/models/ihospitaldepartment';
import { HospitalService } from 'src/app/services/hospital.service';
import { BaseComponent } from '../base-component/base.component';

@Component({
  selector: 'app-department-view',
  templateUrl: './department-view.component.html',
  styleUrls: ['./department-view.component.scss'],
})
export class DepartmentViewComponent
  extends BaseComponent
  implements OnInit, OnDestroy
{
  public columnConfig: Array<IColumnConfig> = [];
  public controls: FormArray = new FormArray([]);
  public addMode = true;
  public addForm: FormGroup = new FormGroup({});
  public loading = true;
  public duplicateCheck: string = '';
  public isAsc = false;
  public departmentData!: Array<IDepartmentData>;
  private hospitalName!: string;
  constructor(private service: HospitalService, private route: ActivatedRoute) {
    super();
    this.route.queryParams.subscribe((param) => {
      if (param.name) {
        this.hospitalName = param.name;
      }
    });
  }
  ngOnInit(): void {
    this.initializeConfig();
    this.service
      .getDepartmentData(this.hospitalName)
      .pipe(takeUntil(this.componentDestroyed))
      .subscribe((res: IDepartmentData[]) => {
        this.loading = false;
        this.departmentData = res;
        if (this.departmentData.length) {
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
        title: 'Department Name',
        field: 'departmentname',
      },
      {
        title: 'Head of Department',
        field: 'head',
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
  public saveEdit(index: number, item: IDepartmentData): void {
    this.loading = true;
    if (this.controls?.at(index).valid) {
      let rawData = (this.controls.at(index) as FormGroup).value;
      rawData = { ...rawData, hospitalname: this.hospitalName };
      this.departmentData[index] = rawData;
    }
    this.service
      .updateDepartmentData(this.departmentData[index] as IDepartmentData)
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
    this.departmentData.splice(index, 1);
    this.service
      .deleteDepartment(rawData.hospitalname)
      .pipe(takeUntil(this.componentDestroyed))
      .subscribe(() => {
        this.loading = false;
      });
    if (this.departmentData.length) {
      this.initializeFormObject();
    }
  }
  /**
   * reset mode
   * @param idx index of the row we want to cancel editing
   */
  public reset(index: number): void {
    this.departmentData[index].editMode = false;
  }
  /**
   * initiliaze the form array
   */
  private initializeFormObject(): void {
    const formGroup = this.departmentData.map((entity) => {
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
    this.departmentData.forEach((item) => {
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
      const idx = this.departmentData.findIndex(
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
      this.departmentData.push(rawData);
      this.addFormInitilize();
      this.service
        .addDepartmentData(rawData as IDepartmentData)
        .pipe(takeUntil(this.componentDestroyed))
        .subscribe(() => {
          this.loading = false;
        });
    }
  }
  /**
   * function used to toggle the sort order between ascending and descending
   */
  public sortBydepartmentName(): void {
    this.loading = true;
    this.departmentData.sort((a, b) =>
      this.isAsc
        ? this.ascending(a, b, 'departmentname')
        : this.descending(a, b, 'departmentname')
    );
    this.isAsc = !this.isAsc;
    this.initializeFormObject();
  }

  /**
   * function used to sort array of objects in ascending order
   * @param a first object
   * @param b second object
   * @param key sorting based on key
   * @returns sorting order ascending
   */
  public ascending(a: any, b: any, key: string): number {
    const first = a[key].toUpperCase();
    const second = b[key].toUpperCase();
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
   * @param a first object
   * @param b second object
   * @param key sorting based on key
   * @returns sorting order descending
   */
  public descending(a: any, b: any, key: string): number {
    const first = a[key].toUpperCase();
    const second = b[key].toUpperCase();
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
