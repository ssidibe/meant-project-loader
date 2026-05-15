import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { TableModule } from 'primeng/table';
import { User, UserDto } from '../../domain.models';
import { TabCol } from '../../ui.models';
import { MultiSelect } from 'primeng/multiselect';
import { FormsModule } from '@angular/forms';
import { Skeleton } from 'primeng/skeleton';
import { UserService } from '../../services/user-service';
import { UtilService } from '../../services/util-service';

@Component({
  selector: 'app-users-list',
  imports: [TableModule, MultiSelect, FormsModule, Skeleton],
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

  constructor(
    private readonly userService: UserService,
    private readonly cdr: ChangeDetectorRef,
    protected readonly utilService: UtilService,
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    console.log('loadUsers');
    this.authorized=true;
    this.setLoading(true);
    this.userService.getAllUsers().subscribe({
      next: (data) => {
        this.users = data;
      },
      error: (err) => {
        const status = err.status;
        if (status === 403) {
          this.authorized = false;

        }else{
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

  protected selectUser(user: UserDto): void {
    this.selectedUser = user;
  }
}
