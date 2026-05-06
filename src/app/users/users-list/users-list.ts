import { Component, OnInit } from '@angular/core';
import { TableModule } from 'primeng/table';
import { User } from '../../domain.models';
import { TabCol } from '../../ui.models';
import { MultiSelect } from 'primeng/multiselect';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-users-list',
  imports: [TableModule, MultiSelect, FormsModule],
  templateUrl: './users-list.html',
  styleUrl: './users-list.scss',
})
export class UsersList implements OnInit {
  protected errMsg: string = '';
  loading: boolean = false;
  users: User[] = [];

  colonnes: TabCol[] = [
    {
      entete: 'ID',
      champ: 'id',
      searchTxt: 'Recherche id',
    },
    {
      entete: 'Nom',
      champ: 'nom',
      searchTxt: 'Recherche nom',
    },
    {
      entete: 'Prenom',
      champ: 'prenom',
      searchTxt: 'Recherche prenom',
    },
    {
      entete: 'Structure',
      champ: 'structure',
      searchTxt: 'structures',
    },
    {
      entete: "Role sur l'appli",
      champ: 'roles',
    },
  ];
  protected selectedColumns: TabCol[]=this.colonnes;

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
  }
}
