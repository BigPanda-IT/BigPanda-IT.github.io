import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss'],
  standalone: false
})

export class UserFormComponent implements OnInit {
  userForm: FormGroup;
  isEditMode = false;
  userId: number | null = null;
  loading = false;
  submitting = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private message: NzMessageService
  ) {
    this.userForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      website: [''],
      fullAddress: [''],
      geo: this.fb.group({
        lat: [''],
        lng: ['']
      }),
      company: this.fb.group({
        name: [''],
        catchPhrase: [''],
        bs: ['']
      })
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.userId = +params['id'];
        this.loadUser();
      }
    });
  }

  loadUser(): void {
    this.loading = true;
    const localUser = this.userService.getLocalUser(this.userId!);

    if (localUser) {
      this.fillForm(localUser);
      this.loading = false;
      return;
    }

    this.userService.getUser(this.userId!).subscribe({
      next: (user) => {
        this.fillForm(user);
        this.loading = false;
      },
      error: () => {
        this.message.error('Ошибка загрузки');
        this.loading = false;
      }
    });
  }

  fillForm(user: User): void {
    const fullAddress = [
      user.address?.street,
      user.address?.suite,
      user.address?.city,
      user.address?.zipcode
    ].filter(Boolean).join(', ');
    
    this.userForm.patchValue({
      name: user.name || '',
      username: user.username || '',
      email: user.email || '',
      phone: user.phone || '',
      website: user.website || '',
      fullAddress: fullAddress,
      geo: {
        lat: user.address?.geo?.lat || '',
        lng: user.address?.geo?.lng || ''
      },
      company: {
        name: user.company?.name || '',
        catchPhrase: user.company?.catchPhrase || '',
        bs: user.company?.bs || ''
      }
    });
  }

  private buildUserFromForm(formValue: any, id?: number): User {
    return {
      id: id || Date.now(),
      name: formValue.name,
      username: formValue.username,
      email: formValue.email,
      phone: formValue.phone,
      website: formValue.website,
      address: {
        street: formValue.fullAddress?.split(',')[0]?.trim() || '',
        suite: formValue.fullAddress?.split(',')[1]?.trim() || '',
        city: formValue.fullAddress?.split(',')[2]?.trim() || '',
        zipcode: formValue.fullAddress?.split(',')[3]?.trim() || '',
        geo: {
          lat: formValue.geo?.lat || '',
          lng: formValue.geo?.lng || ''
        }
      },
      company: {
        name: formValue.company?.name || '',
        catchPhrase: formValue.company?.catchPhrase || '',
        bs: formValue.company?.bs || ''
      }
    };
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      this.message.error('Заполните обязательные поля');
      return;
    }

    this.submitting = true;
    const formValue = this.userForm.value;

    if (this.isEditMode && this.userId) {
      const updatedUser = this.buildUserFromForm(formValue, this.userId);
      this.userService.updateLocalUser(this.userId, updatedUser);
      this.message.success('✅ Пользователь обновлён');
      this.userService.updateUser(this.userId, formValue).subscribe();
    } else {
      const newUser = this.buildUserFromForm(formValue);
      this.userService.addLocalUser(newUser);
      this.message.success('✅ Пользователь создан');
      this.userService.createUser(formValue).subscribe();
    }
    
    this.router.navigate(['/users']);
    this.submitting = false;
  }

  onCancel(): void {
    this.router.navigate(['/users']);
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.userForm.get(fieldName);
    return control ? control.invalid && (control.dirty || control.touched) : false;
  }

  getFieldError(fieldName: string): string {
    const control = this.userForm.get(fieldName);
    if (!control) return '';
    if (control.hasError('required')) return 'Поле обязательно';
    if (control.hasError('email')) return 'Введите корректный email';
    if (control.hasError('minlength')) return 'Минимум ' + control.getError('minlength').requiredLength + ' символов';
    return '';
  }
}