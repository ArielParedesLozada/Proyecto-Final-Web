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

class GoalDeclineEmail extends Mailable
{
    use Queueable, SerializesModels;

    public $goal;
    public $user;
    public $currentSaved;
    public $suggestedAmount;
    public $daysUntilDeadline;

    /**
     * Create a new message instance.
     */
    public function __construct(Goal $goal, User $user, $currentSaved, $suggestedAmount, $daysUntilDeadline)
    {
        $this->goal = $goal;
        $this->user = $user;
        $this->currentSaved = $currentSaved;
        $this->suggestedAmount = $suggestedAmount;
        $this->daysUntilDeadline = $daysUntilDeadline;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '⚠️ Alerta: Tu meta de ahorro está en declive',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.goal-decline',
            with: [
                'goal' => $this->goal,
                'user' => $this->user,
                'currentSaved' => $this->currentSaved,
                'suggestedAmount' => $this->suggestedAmount,
                'daysUntilDeadline' => $this->daysUntilDeadline,
                'progressPercentage' => $this->goal->target_amount > 0 ? 
                    round(($this->currentSaved / $this->goal->target_amount) * 100, 1) : 0,
                'deficit' => max(0, $this->suggestedAmount - $this->currentSaved),
                'alertDate' => now()->format('d/m/Y'),
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
