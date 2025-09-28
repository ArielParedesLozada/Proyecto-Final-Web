<?php

namespace App\Mail;

use App\Models\Goal;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class GoalCompletedEmail extends Mailable
{
    use Queueable, SerializesModels;

    public $goal;
    public $user;

    /**
     * Create a new message instance.
     */
    public function __construct(Goal $goal, User $user)
    {
        $this->goal = $goal;
        $this->user = $user;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '🎉 ¡Felicitaciones! Has completado tu meta de ahorro',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.goal-completed',
            with: [
                'goal' => $this->goal,
                'user' => $this->user,
                'completionDate' => now()->format('d/m/Y'),
                'totalSaved' => $this->goal->transactions()
                    ->where('type', 'income')
                    ->sum('amount'),
            ]
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
