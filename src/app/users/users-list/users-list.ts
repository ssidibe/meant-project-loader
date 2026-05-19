import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { TableModule } from 'primeng/table';
import { InscriptionRequest, Structure, User, UserDto } from '../../domain.models';
import { TabCol } from '../../ui.models';
import { MultiSelect } from 'primeng/multiselect';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Skeleton } from 'primeng/skeleton';
import { UserService } from '../../services/user-service';
import { UtilService } from '../../services/util-service';
import { Dialog } from 'primeng/dialog';
import { Button } from 'primeng/button';
import { EngagementService } from '../../services/engagement-service';
import { passwordMatchValidator } from '../../validators/match';

@Component({
  selector: 'app-users-list',
  imports: [TableModule, MultiSelect, FormsModule, Skeleton, Dialog, Button, ReactiveFormsModule],
  templateUrl: './users-list.html',
  styleUrl: './users-list.scss',
})
export class UsersList implements OnInit {
  protected errMsg: string = '';
  loading: boolean = false;
  users: UserDto[] = [];
  selectedUser: UserDto | undefined;
  skeletonHeight: string = '2rem';
  authorized: boolean = true;
  editMode: boolean = false;
  civilites: string[] = [
    'Monsieur',
    'Madame',
    'Directeur',
    'Président',
    'Colonel',
    'Lieutenant',
    'Professeur',
    'Docteur',
  ].sort((a, b) => a.localeCompare(b));

  userForm = new FormGroup<any>(
    {
      id: new FormControl(null),
      prenom: new FormControl('', [Validators.required]),
      nom: new FormControl('', [Validators.required]),
      tel: new FormControl(''),
      email: new FormControl('', [Validators.required, Validators.email]),
      pwd1: new FormControl('', [Validators.required]),
      pwd2: new FormControl('', [Validators.required]),
      structure: new FormControl(null, [Validators.required]),
      enabled: new FormControl(true),
      verified: new FormControl(false),
      titre: new FormControl('', [Validators.required]),
      roles: new FormControl([]),
    },
    { validators: passwordMatchValidator },
  );

  colonnes: TabCol[] = [
    {
      entete: 'ID',
      champ: 'id',
    },
    {
      entete: 'Nom',
      champ: 'nom',
      searchTxt: 'Recherche nom',
    },
    {
      entete: 'Prénom',
      champ: 'prenom',
      searchTxt: 'Recherche prenom',
    },
    {
      entete: 'Téléphone',
      champ: 'telephone',
      searchTxt: 'Recherche telephone',
    },
    {
      entete: 'Email',
      champ: 'email',
      searchTxt: 'Recherche email',
    },
    {
      entete: 'Structure',
      champ: 'structure',
      searchTxt: 'structure',
    },
    {
      entete: "Role sur l'appli",
      champ: 'roles',
    },
  ];
  protected selectedColumns: TabCol[] = this.colonnes;
  protected structures: Structure[] = [];
  loadingStructures = false;
  editError = '';
  saving = false;

  constructor(
    private readonly userService: UserService,
    private readonly cdr: ChangeDetectorRef,
    protected readonly utilService: UtilService,
    private readonly engagementService: EngagementService,
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    console.log('loadUsers');
    this.authorized = true;
    this.setLoading(true);
    this.userService.getAllUsers().subscribe({
      next: (data) => {
        this.users = data;
      },
      error: (err) => {
        const status = err.status;
        if (status === 403) {
          this.authorized = false;
        } else {
          this.errMsg = `${err.message}`;
        }
        this.setLoading(false);
      },
      complete: () => {
        this.setLoading(false);
      },
    });
  }

  private setLoading(loading: boolean): void {
    this.loading = loading;
    this.cdr.detectChanges();
  }

  private setLoadingStructures(loading: boolean): void {
    this.loadingStructures = loading;
    this.cdr.detectChanges();
  }

  protected selectUser(user: UserDto): void {
    this.selectedUser = user;
  }

  showDialog() {
    this.setEditMode(true);
    this.setLoadingStructures(true);
    this.engagementService.getAllPartenaires().subscribe({
      next: (data) => {
        this.structures = data;
      },
      complete: () => {
        this.loadingStructures = false;
        this.setLoadingStructures(false);
      },
      error: (err) => {
        this.loadingStructures = false;
        this.editError = `erreur : ${err}`;
        this.setLoadingStructures(false);
      },
    });
  }

  setEditMode(editMode: boolean): void {
    this.editMode = editMode;
    this.cdr.detectChanges();
  }

  createForm(): FormGroup<any> {
    return new FormGroup<any>(
      {
        id: new FormControl(null),
        prenom: new FormControl('', [Validators.required]),
        nom: new FormControl('', [Validators.required]),
        tel: new FormControl(''),
        email: new FormControl('', [Validators.required]),
        pwd1: new FormControl('', [Validators.required]),
        pwd2: new FormControl('', [Validators.required]),
        structure: new FormControl(null, [Validators.required]),
        enabled: new FormControl(true),
        verified: new FormControl(false),
        titre: new FormControl('', [Validators.required]),
        roles: new FormControl([]),
      },
      { validators: passwordMatchValidator },
    );
  }

  protected inscrireUser() {
    const user: InscriptionRequest = {
      prenom: this.userForm.controls['prenom'].value,
      nom: this.userForm.controls['nom'].value,
      password: this.userForm.controls['pwd1'].value,
      email: this.userForm.controls['email'].value,
      enabled: this.userForm.controls['enabled'].value,
      verified: this.userForm.controls['verified'].value,
      titre: this.userForm.controls['titre'].value,
      structure: this.userForm.controls['structure'].value,
      roles: this.userForm.controls['roles'].value,
    };

    this.setSaving(true);
    this.userService.inscrire(user).subscribe({
      next: (data) => {
        this.users = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        switch (err.status) {
          case 461:
            this.editError="il y'a un utilisateur qui a déja cette email";
            break;
          default:
            this.editError = `${err}`;
        }
        this.setSaving(false);
      },
      complete: () => {
        this.setSaving(false);
        this.editMode = false;
        this.userForm = this.createForm();
        this.cdr.detectChanges();
      },
    });
  }

  private setSaving(saving: boolean) {
    this.saving = saving;
    this.cdr.detectChanges();
  }
}
