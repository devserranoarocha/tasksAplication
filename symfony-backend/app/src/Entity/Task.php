<?php

namespace App\Entity;

use App\Repository\TaskRepository;
use Doctrine\ORM\Mapping as ORM;
use App\Entity\User; // <-- Importamos entidad User

#[ORM\Entity(repositoryClass: TaskRepository::class)]
class Task
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $title = null;
    
    // Se ha cambiado de string a bool
    // Tipo boolean y valor por defecto (si la configuracion de la bd lo permite)
    #[ORM\Column(type: 'boolean', options: ['default' => false])]
    private ?bool $completed = null;

    // Declaramos nuevo campo
    /* "options: ['default' => 'CURRENT_TIMESTAMP'])]" Asegura que el createdAt se establezca en
        el momento de la insercion en BD. OJO si la configuracion de la bd lo permite.
        Usa automáticamente la marca de tiempo actual del servidor de la base de datos.  */ 
    #[ORM\Column(type: 'datetime_immutable', options: ['default' => 'CURRENT_TIMESTAMP'])]
    private ?\DateTimeImmutable $createdAt= null;

    // --- NUEVO CAMPO: Relación ManyToOne con la entidad User ---
    #[ORM\ManyToOne(targetEntity: User::class, inversedBy: 'tasks')] // Define la relación
    #[ORM\JoinColumn(nullable: false)] // Indica que no puede ser NULL (una tarea debe tener un creador)
    private ?User $user = null; // Propiedad para almacenar el objeto User completo, no solo el ID

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getTitle(): ?string
    {
        return $this->title;
    }

    public function setTitle(?string $title): static
    {
        $this->title = $title;

        return $this;
    }

    // Cambiamos Getters y Setters para que acepten/devuelvan bool 
    public function getCompleted(): ?bool
    {
        return $this->completed;
    }

    public function setCompleted(?bool $completed): static
    {
        $this->completed = $completed;

        return $this;
    }

    // Funcion Get para createdAt    
    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->createdAt;
    }

    // Funcion Set para createdAt
    public function setCreatedAt(\DateTimeImmutable $createdAt): static
    {
        $this->createdAt = $createdAt;

        return $this;
    }

    // --- Getters y Setters para la relación con User ---
    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(?User $user): static
    {
        $this->user = $user;
        return $this;
    }

    // Constructor para inicializar 'createdAt' y 'completed' al crear un objeto y asegurarnos que no es NULL
    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
        //Inicializamos completed a false por defecto.
        $this->completed = false;
    }
}
