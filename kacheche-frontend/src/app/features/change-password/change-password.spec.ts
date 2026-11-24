import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ChangePassword } from './change-password';

describe('ChangePassword', () => {
  let component: ChangePassword;
  let fixture: ComponentFixture<ChangePassword>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChangePassword],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ChangePassword);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
