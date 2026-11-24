import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { RoleForm } from './role-form';

describe('RoleForm', () => {
  let component: RoleForm;
  let fixture: ComponentFixture<RoleForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoleForm],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RoleForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
