<?php

namespace App\Controller;

use App\Entity\Task;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Security\Core\User\UserInterface;

// Nueva logica en los metodos para el usuario autenticado

#[Route('/api/tasks')]
class TaskController extends AbstractController
{
    /**
     * Lista todas las tareas para el usuario autenticado.
     */
    #[Route('', name: 'list_tasks', methods: ['GET'])]
    public function list(EntityManagerInterface $em, UserInterface $currentUser): JsonResponse // <-- Inyecta $currentUser
    {
        // Seguridad: Asegurarse de que el usuario autenticado es una instancia de tu entidad User
        if (!$currentUser instanceof User) {
            return $this->json(['error' => 'User not authenticated or invalid user object.'], 401);
        }

        // Obtener solo las tareas que pertenecen al usuario actual
        // findBy() permite filtrar por un campo y devuelve un array
        $tasks = $em->getRepository(Task::class)->findBy(['user' => $currentUser]);

        $data = array_map(fn($task) => [
            'id' => $task->getId(),
            'title' => $task->getTitle(),
            'completed' => $task->getCompleted(),
            'createdAt' => $task->getCreatedAt()?->format('Y-m-d H:i:s'),
            'userId' => $task->getUser()?->getId() // <-- Incluimos el userId en la respuesta
        ], $tasks);
        return $this->json($data);
    }

    /**
     * Lista las tareas del usuario autenticado ordenadas por ID.
     */
    #[Route('/ordered_tasks_by_id', name:'ordered_tasks_by_id', methods:['GET'])]
    public function orderedTasksById(Request $request, EntityManagerInterface  $em, UserInterface $currentUser): JsonResponse // <-- Inyecta $currentUser
    {
        // Seguridad: Asegurarse de que el usuario autenticado es una instancia de tu entidad User
        if (!$currentUser instanceof User) {
            return $this->json(['error' => 'User not authenticated or invalid user object.'], 401);
        }

        // Parámetro 'order', por defecto 'ASC'
        $order = $request->query->get('order', 'ASC');
        $order = strtoupper($order); // Convertimos a MAYÚSCULAS

        // Validamos que 'order' sea 'ASC' o 'DESC'
        if (!in_array($order, ['ASC', 'DESC'])) {
            return $this->json(['error' => 'Invalid order parameter. Must be "ASC" or "DESC".'], 400);
        }

        // Usamos findBy para filtrar por usuario y ordenar por ID
        $tasks = $em->getRepository(Task::class)->findBy(
            ['user' => $currentUser], // Filtra por el usuario actual
            ['id' => $order]         // Ordena por ID
        );

        $data = array_map(fn($task) => [
            'id' => $task->getId(),
            'title' => $task->getTitle(),
            'completed' => $task->getCompleted(),
            'createdAt' => $task->getCreatedAt()?->format('Y-m-d H:i:s'),
            'userId' => $task->getUser()?->getId() // <-- Incluimos el userId
        ], $tasks);
        return $this->json($data);
    }

    /**
     * Crea una nueva tarea y la asocia al usuario autenticado.
     */
    #[Route('', name: 'create_task', methods: ['POST'])]
    public function create(Request $request, EntityManagerInterface $em, UserInterface $currentUser): JsonResponse // <-- Inyecta $currentUser
    {
        // Seguridad: Asegurarse de que el usuario autenticado es una instancia de tu entidad User
        if (!$currentUser instanceof User) {
            return $this->json(['error' => 'User not authenticated or invalid user object.'], 401);
        }

        $params = json_decode($request->getContent(), true);

        // Validación básica: El título no puede estar vacío
        if (!isset($params['title']) || empty(trim($params['title']))) {
            return $this->json(['error' => 'Title cannot be empty.'], 400);
        }

        $task = new Task();
        $task->setTitle(trim($params['title']));
        $task->setCompleted($params['completed'] ?? false);
        // $task->setCreatedAt(new \DateTimeImmutable());  // Esto ya no es necesario si tienes el constructor en Task.php

        // ¡Asignar la tarea al usuario actualmente autenticado!
        $task->setUser($currentUser);

        $em->persist($task);
        $em->flush();

        return $this->json([
            'id' => $task->getId(),
            'title' => $task->getTitle(),
            'completed' => $task->getCompleted(),
            'createdAt' => $task->getCreatedAt()?->format('Y-m-d H:i:s'),
            'userId' => $currentUser->getId() // <-- Incluir el ID del usuario en la respuesta
        ], 201); // 201 Created
    }

    /**
     * Marca todas las tareas del usuario autenticado como completadas.
     * Importante: Esto SOLO afectará a las tareas del usuario logeado.
     */
    #[Route('/mark_all_completed', name: 'mark_all_completed', methods: ['PUT'])]
    public function markAllCompleted(EntityManagerInterface $em, UserInterface $currentUser): JsonResponse // <-- Inyecta $currentUser
    {
        // Seguridad: Asegurarse de que el usuario autenticado es una instancia de tu entidad User
        if (!$currentUser instanceof User) {
            return $this->json(['error' => 'User not authenticated or invalid user object.'], 401);
        }

        // Obtenemos todas las tareas del usuario actual
        $tasks = $em->getRepository(Task::class)->findBy(['user' => $currentUser]);

        // Marcamos las tareas como completadas
        foreach ($tasks as $task){
            $task->setCompleted(true);
        }

        // Guardamos los cambios en la base de datos
        $em->flush();

        // Devolvemos Json con la lista de las tareas actualizadas del usuario
        $data = array_map(fn($task) => [
            'id' => $task->getId(),
            'title' => $task->getTitle(),
            'completed' => $task->getCompleted(),
            'createdAt' => $task->getCreatedAt()?->format('Y-m-d H:i:s'),
            'userId' => $task->getUser()?->getId() // <-- Incluimos el userId
        ], $tasks);
        return $this->json($data);
    }

    /**
     * Elimina una tarea existente.
     * Solo permite eliminar la tarea si pertenece al usuario autenticado.
     */
    #[Route('/{id}', name: 'delete_task', methods: ['DELETE'])]
    public function delete($id, EntityManagerInterface $em, UserInterface $currentUser): JsonResponse // <-- Inyecta $currentUser
    {
        // Seguridad: Verificar que el usuario esté autenticado
        if (!$currentUser instanceof User) {
            return $this->json(['error' => 'User not authenticated.'], 401);
        }

        $task = $em->getRepository(Task::class)->find($id);

        if (!$task) {
            return $this->json(['error' => 'Task not found'], 404);
        }

        // ¡Autorización: Asegurarse de que el usuario autenticado sea el PROPIETARIO de la tarea!
        if ($task->getUser()->getId() !== $currentUser->getId()) {
            return $this->json(['error' => 'You are not authorized to delete this task.'], 403); // 403 Forbidden
        }

        $em->remove($task);
        $em->flush();
        return $this->json(['message' => 'Task deleted']);
    }

    /**
     * Actualiza una tarea existente.
     * Solo permite actualizar la tarea si pertenece al usuario autenticado.
     */
    #[Route('/{id}', name: 'update_task', methods: ['PUT'])]
    public function update($id, Request $request, EntityManagerInterface $em, UserInterface $currentUser): JsonResponse // <-- Inyecta $currentUser
    {
        // Seguridad: Verificar que el usuario esté autenticado
        if (!$currentUser instanceof User) {
            return $this->json(['error' => 'User not authenticated.'], 401);
        }

        $task = $em->getRepository(Task::class)->find($id);

        if (!$task) {
            return $this->json(['error' => 'Task not found'], 404);
        }

        // ¡Autorización: Asegurarse de que el usuario autenticado sea el PROPIETARIO de la tarea!
        if ($task->getUser()->getId() !== $currentUser->getId()) {
            return $this->json(['error' => 'You are not authorized to update this task.'], 403);
        }

        $params = json_decode($request->getContent(), true);

        if (isset($params['title'])) {
            if (empty(trim($params['title']))) {
                return $this->json(['error' => 'Title cannot be empty.'], 400);
            }
            $task->setTitle(trim($params['title']));
        }
        if (isset($params['completed'])) {
            $task->setCompleted($params['completed']);
        }
        $em->flush();

        return $this->json([
            'id' => $task->getId(),
            'title' => $task->getTitle(),
            'completed' => $task->getCompleted(),
            'createdAt' => $task->getCreatedAt()?->format('Y-m-d H:i:s'),
            'userId' => $task->getUser()?->getId() // <-- Incluimos el userId
        ]);
    }
}